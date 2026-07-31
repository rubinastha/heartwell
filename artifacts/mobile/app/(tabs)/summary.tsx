import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAppData } from '@/context/AppDataContext';
import { exportHealthSummaryPDF } from '@/utils/exportSummary';

type Range = 7 | 30 | 90;
const RANGES: Range[] = [7, 30, 90];

const SYMPTOM_KEYS = ['chest_tightness', 'fatigue', 'shortness_of_breath', 'dizziness'];
const SYMPTOM_LABELS: Record<string, string> = {
  chest_tightness: 'Chest tightness',
  fatigue: 'Fatigue',
  shortness_of_breath: 'Short. of breath',
  dizziness: 'Dizziness',
};

const MOOD_COLORS = ['', '#E07A7A', '#D4956A', '#8AA8B8', '#5EB8A0', '#3A9EA5'];
const MOOD_LABELS = ['', 'Rough', 'Low', 'Okay', 'Good', 'Great'];

function getDaysArray(days: number): Date[] {
  const result: Date[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    result.push(d);
  }
  return result;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function SummaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { checkIns, savedWords, profile } = useAppData();
  const [range, setRange] = useState<Range>(7);
  const [exporting, setExporting] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const s = styles(colors);

  async function handleExport() {
    if (!hasData) return;
    setExporting(true);
    try {
      await exportHealthSummaryPDF(stats, savedWords, profile, range);
    } catch (err: any) {
      Alert.alert('Export failed', err?.message ?? 'Could not generate the report. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  const stats = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    cutoff.setHours(0, 0, 0, 0);
    const filtered = checkIns.filter(
      (c) => new Date(c.date).getTime() >= cutoff.getTime(),
    );

    const totalCheckIns = filtered.length;
    const tookMedDays = filtered.filter((c) => c.tookMedication).length;
    const adherence = totalCheckIns > 0 ? Math.round((tookMedDays / totalCheckIns) * 100) : 0;

    const avgMood =
      filtered.length > 0
        ? filtered.reduce((sum, c) => sum + c.mood, 0) / filtered.length
        : 0;

    // Symptom frequency
    const symptomCounts: Record<string, number> = {};
    SYMPTOM_KEYS.forEach((k) => (symptomCounts[k] = 0));
    filtered.forEach((c) => {
      c.symptoms.forEach((s) => {
        if (s in symptomCounts) symptomCounts[s]++;
      });
    });

    // Mood per day
    const days = getDaysArray(range);
    const moodByDay = days.map((day) => {
      const dayCheckins = filtered.filter((c) => isSameDay(new Date(c.date), day));
      if (dayCheckins.length === 0) return null;
      return Math.round(
        dayCheckins.reduce((sum, c) => sum + c.mood, 0) / dayCheckins.length,
      );
    });

    return {
      totalCheckIns,
      adherence,
      avgMood,
      symptomCounts,
      moodByDay,
      days,
      filtered,
    };
  }, [checkIns, range]);

  const hasData = stats.totalCheckIns > 0;

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTopRow}>
            <Text style={s.headerTitle}>Summary</Text>
            {hasData && (
              <TouchableOpacity
                style={[s.exportBtn, exporting && s.exportBtnDisabled]}
                onPress={handleExport}
                activeOpacity={0.7}
                disabled={exporting}
              >
                {exporting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="share" size={14} color="#fff" />
                    <Text style={s.exportBtnText}>Export PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
          <View style={s.rangeRow}>
            {RANGES.map((r) => (
              <TouchableOpacity
                key={r}
                style={[s.rangeChip, range === r && s.rangeChipActive]}
                onPress={() => setRange(r)}
                activeOpacity={0.7}
              >
                <Text style={[s.rangeChipText, range === r && s.rangeChipTextActive]}>
                  {r} days
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {!hasData ? (
          <View style={s.emptyState}>
            <Feather name="bar-chart-2" size={48} color={colors.mutedForeground} />
            <Text style={s.emptyTitle}>No check-ins yet</Text>
            <Text style={s.emptyText}>
              Log daily check-ins to see your trends and stats here.
            </Text>
          </View>
        ) : (
          <>
            {/* Overview cards */}
            <View style={s.overviewRow}>
              <View style={[s.overviewCard, { flex: 1 }]}>
                <Text style={s.overviewValue}>{stats.totalCheckIns}</Text>
                <Text style={s.overviewLabel}>Check-ins</Text>
              </View>
              <View style={[s.overviewCard, { flex: 1 }]}>
                <Text style={[s.overviewValue, { color: getMoodColor(stats.avgMood) }]}>
                  {stats.avgMood > 0 ? MOOD_LABELS[Math.round(stats.avgMood)] : '—'}
                </Text>
                <Text style={s.overviewLabel}>Avg. Mood</Text>
              </View>
            </View>

            {/* Medication adherence */}
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <Ionicons name="medical-outline" size={18} color={colors.primary} />
                <Text style={s.cardTitle}>Medication Adherence</Text>
              </View>
              <Text style={[s.bigPercent, { color: getAdherenceColor(stats.adherence, colors) }]}>
                {stats.adherence}%
              </Text>
              <View style={s.progressTrack}>
                <View
                  style={[
                    s.progressFill,
                    {
                      width: `${stats.adherence}%` as any,
                      backgroundColor: getAdherenceColor(stats.adherence, colors),
                    },
                  ]}
                />
              </View>
              <Text style={s.adherenceCaption}>
                Took medication {stats.filtered.filter((c) => c.tookMedication).length} of{' '}
                {stats.totalCheckIns} days
              </Text>
            </View>

            {/* Mood trend */}
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <Ionicons name="trending-up-outline" size={18} color={colors.primary} />
                <Text style={s.cardTitle}>Mood Trend</Text>
              </View>
              <View style={s.moodTrendChart}>
                {stats.moodByDay.map((mood, i) => (
                  <View key={i} style={s.moodDayColumn}>
                    <View style={s.moodBarContainer}>
                      {mood !== null ? (
                        <View
                          style={[
                            s.moodBar,
                            {
                              height: `${(mood / 5) * 100}%` as any,
                              backgroundColor: MOOD_COLORS[mood],
                            },
                          ]}
                        />
                      ) : (
                        <View style={s.moodBarEmpty} />
                      )}
                    </View>
                    {(range === 7 || i % Math.ceil(range / 7) === 0) && (
                      <Text style={s.moodDayLabel}>
                        {stats.days[i].getDate()}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
              <View style={s.moodLegend}>
                {[1, 3, 5].map((m) => (
                  <View key={m} style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: MOOD_COLORS[m] }]} />
                    <Text style={s.legendText}>{MOOD_LABELS[m]}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Symptom frequency */}
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <Ionicons name="pulse-outline" size={18} color={colors.primary} />
                <Text style={s.cardTitle}>Symptom Frequency</Text>
              </View>
              {SYMPTOM_KEYS.map((key) => {
                const count = stats.symptomCounts[key] ?? 0;
                const pct =
                  stats.totalCheckIns > 0
                    ? Math.round((count / stats.totalCheckIns) * 100)
                    : 0;
                return (
                  <View key={key} style={s.symptomBarRow}>
                    <Text style={s.symptomBarLabel}>{SYMPTOM_LABELS[key]}</Text>
                    <View style={s.symptomTrack}>
                      <View
                        style={[
                          s.symptomFill,
                          {
                            width: `${pct}%` as any,
                            backgroundColor: pct > 60 ? '#D4956A' : colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={s.symptomPct}>{pct}%</Text>
                  </View>
                );
              })}
              <Text style={s.symptomCaption}>
                % of check-ins where symptom was reported
              </Text>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function getMoodColor(avg: number): string {
  if (avg <= 0) return '#8AA8B8';
  const rounded = Math.round(avg);
  return MOOD_COLORS[Math.max(1, Math.min(5, rounded))];
}

function getAdherenceColor(
  pct: number,
  colors: ReturnType<typeof useColors>,
): string {
  if (pct >= 80) return colors.primary;
  if (pct >= 50) return '#D4956A';
  return '#E07A7A';
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    header: { paddingVertical: 20 },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
    },
    exportBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },
    exportBtnDisabled: {
      opacity: 0.6,
    },
    exportBtnText: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: '#fff',
    },
    rangeRow: { flexDirection: 'row', gap: 8 },
    rangeChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.muted,
    },
    rangeChipActive: { backgroundColor: colors.primary },
    rangeChipText: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    rangeChipTextActive: { color: '#fff' },
    emptyState: {
      alignItems: 'center',
      paddingTop: 80,
      gap: 12,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      textAlign: 'center',
      lineHeight: 22,
    },
    overviewRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    overviewCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    overviewValue: {
      fontSize: 28,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
    },
    overviewLabel: {
      fontSize: 12,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
      marginTop: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    bigPercent: {
      fontSize: 44,
      fontFamily: 'Inter_700Bold',
      marginBottom: 12,
    },
    progressTrack: {
      height: 10,
      backgroundColor: colors.muted,
      borderRadius: 5,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 5,
    },
    adherenceCaption: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    moodTrendChart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 100,
      gap: 3,
      marginBottom: 12,
    },
    moodDayColumn: {
      flex: 1,
      alignItems: 'center',
      height: '100%',
      justifyContent: 'flex-end',
    },
    moodBarContainer: {
      flex: 1,
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    moodBar: {
      width: '80%',
      borderRadius: 3,
      minHeight: 4,
    },
    moodBarEmpty: {
      width: '80%',
      height: 4,
      backgroundColor: colors.muted,
      borderRadius: 3,
    },
    moodDayLabel: {
      fontSize: 9,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      marginTop: 4,
    },
    moodLegend: {
      flexDirection: 'row',
      gap: 16,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    symptomBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    symptomBarLabel: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
      width: 100,
    },
    symptomTrack: {
      flex: 1,
      height: 8,
      backgroundColor: colors.muted,
      borderRadius: 4,
      overflow: 'hidden',
    },
    symptomFill: {
      height: '100%',
      borderRadius: 4,
    },
    symptomPct: {
      fontSize: 12,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
      width: 32,
      textAlign: 'right',
    },
    symptomCaption: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      marginTop: 4,
    },
  });
