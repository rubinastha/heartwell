import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { CheckIn, SavedWord, useAppData } from '@/context/AppDataContext';

type Filter = 'all' | 'words' | 'checkins';

type TimelineEntry =
  | { type: 'word'; data: SavedWord; date: string }
  | { type: 'checkin'; data: CheckIn; date: string };

const MOOD_LABELS = ['', 'Rough', 'Low', 'Okay', 'Good', 'Great'];
const MOOD_COLORS = ['', '#E07A7A', '#D4956A', '#8AA8B8', '#5EB8A0', '#3A9EA5'];
const MOOD_ICONS = [
  '',
  'emoticon-sad-outline',
  'emoticon-frown-outline',
  'emoticon-neutral-outline',
  'emoticon-happy-outline',
  'emoticon-excited-outline',
] as const;

const SYMPTOM_LABELS: Record<string, string> = {
  chest_tightness: 'Chest tightness',
  fatigue: 'Fatigue',
  shortness_of_breath: 'Shortness of breath',
  dizziness: 'Dizziness',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TimelineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { savedWords, checkIns, getSavedWordById } = useAppData();

  const [filter, setFilter] = useState<Filter>('all');
  const [detail, setDetail] = useState<TimelineEntry | null>(null);

  const entries = useMemo<TimelineEntry[]>(() => {
    const wordEntries: TimelineEntry[] = savedWords.map((w) => ({
      type: 'word',
      data: w,
      date: w.savedAt,
    }));
    const checkinEntries: TimelineEntry[] = checkIns.map((c) => ({
      type: 'checkin',
      data: c,
      date: c.date,
    }));

    let combined: TimelineEntry[] = [];
    if (filter === 'all') combined = [...wordEntries, ...checkinEntries];
    else if (filter === 'words') combined = wordEntries;
    else combined = checkinEntries;

    return combined.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [savedWords, checkIns, filter]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const s = styles(colors);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'words', label: 'Saved Words' },
    { key: 'checkins', label: 'Check-ins' },
  ];

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Timeline</Text>
        <View style={s.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[s.filterChip, filter === f.key && s.filterChipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  s.filterChipText,
                  filter === f.key && s.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.type + item.data.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={entries.length > 0}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Feather name="clock" size={40} color={colors.mutedForeground} />
            <Text style={s.emptyTitle}>Nothing here yet</Text>
            <Text style={s.emptyText}>
              {filter === 'words'
                ? 'Save words from the Lookup tab'
                : filter === 'checkins'
                ? 'Log a daily check-in to get started'
                : 'Your saved words and check-ins will appear here'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.entryCard}
            onPress={() => setDetail(item)}
            activeOpacity={0.7}
          >
            {item.type === 'word' ? (
              <WordEntry entry={item} colors={colors} />
            ) : (
              <CheckInEntry
                entry={item}
                colors={colors}
                getWordById={getSavedWordById}
              />
            )}
            <Text style={s.entryDate}>{formatDate(item.date)}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Detail Modal */}
      <Modal
        visible={!!detail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetail(null)}
      >
        {detail && (
          <View style={[s.modalContainer, { backgroundColor: colors.background }]}>
            <View style={s.modalHeader}>
              <TouchableOpacity
                style={s.closeBtn}
                onPress={() => setDetail(null)}
              >
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={s.modalHeaderLabel}>
                {detail.type === 'word' ? 'Saved Word' : 'Check-in'}
              </Text>
              <View style={{ width: 36 }} />
            </View>
            <ScrollView
              style={{ flex: 1, paddingHorizontal: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {detail.type === 'word' ? (
                <WordDetail word={detail.data as SavedWord} colors={colors} />
              ) : (
                <CheckInDetail
                  checkin={detail.data as CheckIn}
                  colors={colors}
                  getWordById={getSavedWordById}
                />
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

function WordEntry({
  entry,
  colors,
}: {
  entry: TimelineEntry & { type: 'word' };
  colors: ReturnType<typeof useColors>;
}) {
  const s = styles(colors);
  return (
    <View style={s.entryRow}>
      <View style={[s.entryIcon, { backgroundColor: colors.secondary }]}>
        <Ionicons name="bookmark" size={18} color={colors.primary} />
      </View>
      <View style={s.entryContent}>
        <Text style={s.entryTitle}>{(entry.data as SavedWord).term}</Text>
        <Text style={s.entryPreview} numberOfLines={1}>
          {(entry.data as SavedWord).explanation}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </View>
  );
}

function CheckInEntry({
  entry,
  colors,
  getWordById,
}: {
  entry: TimelineEntry & { type: 'checkin' };
  colors: ReturnType<typeof useColors>;
  getWordById: (id: string) => SavedWord | undefined;
}) {
  const checkin = entry.data as CheckIn;
  const mood = checkin.mood;
  const moodColor = MOOD_COLORS[mood] ?? colors.mutedForeground;
  const s = styles(colors);
  return (
    <View style={s.entryRow}>
      <View style={[s.entryIcon, { backgroundColor: moodColor + '20' }]}>
        <MaterialCommunityIcons
          name={MOOD_ICONS[mood] as any}
          size={22}
          color={moodColor}
        />
      </View>
      <View style={s.entryContent}>
        <Text style={s.entryTitle}>
          Feeling {MOOD_LABELS[mood]}
          {checkin.tookMedication ? ' · Medication' : ''}
        </Text>
        <Text style={s.entryPreview} numberOfLines={1}>
          {checkin.symptoms.length > 0
            ? checkin.symptoms.map((s) => SYMPTOM_LABELS[s]).join(', ')
            : checkin.note
            ? checkin.note
            : 'No symptoms reported'}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </View>
  );
}

function WordDetail({
  word,
  colors,
}: {
  word: SavedWord;
  colors: ReturnType<typeof useColors>;
}) {
  const s = styles(colors);
  return (
    <>
      <Text style={s.detailTitle}>{word.term}</Text>
      <Text style={s.detailDate}>Saved {formatFullDate(word.savedAt)}</Text>

      <View style={s.detailSection}>
        <Text style={s.detailSectionLabel}>What it means</Text>
        <Text style={s.detailSectionText}>{word.explanation}</Text>
      </View>

      <View style={[s.detailSection, s.whyCard, { backgroundColor: colors.secondary }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <Text style={[s.detailSectionLabel, { color: colors.primary }]}>Why this matters</Text>
        </View>
        <Text style={s.detailSectionText}>{word.whyItMatters}</Text>
      </View>

      {word.personalNote && (
        <View style={s.detailSection}>
          <Text style={s.detailSectionLabel}>Your note</Text>
          <Text style={s.detailSectionText}>{word.personalNote}</Text>
        </View>
      )}
    </>
  );
}

function CheckInDetail({
  checkin,
  colors,
  getWordById,
}: {
  checkin: CheckIn;
  colors: ReturnType<typeof useColors>;
  getWordById: (id: string) => SavedWord | undefined;
}) {
  const s = styles(colors);
  const mood = checkin.mood;
  const moodColor = MOOD_COLORS[mood] ?? colors.mutedForeground;
  const taggedWord = checkin.taggedWordId ? getWordById(checkin.taggedWordId) : undefined;

  return (
    <>
      <Text style={s.detailTitle}>Check-in</Text>
      <Text style={s.detailDate}>{formatFullDate(checkin.date)}</Text>

      {/* Mood */}
      <View style={[s.moodDisplay, { backgroundColor: moodColor + '18' }]}>
        <MaterialCommunityIcons name={MOOD_ICONS[mood] as any} size={40} color={moodColor} />
        <Text style={[s.moodDisplayText, { color: moodColor }]}>{MOOD_LABELS[mood]}</Text>
      </View>

      {/* Medication */}
      <View style={[s.detailChip, { backgroundColor: checkin.tookMedication ? colors.secondary : colors.muted }]}>
        <Ionicons
          name={checkin.tookMedication ? 'medical' : 'medical-outline'}
          size={16}
          color={checkin.tookMedication ? colors.primary : colors.mutedForeground}
        />
        <Text style={[s.detailChipText, { color: checkin.tookMedication ? colors.primary : colors.mutedForeground }]}>
          {checkin.tookMedication ? 'Took medication' : 'Did not take medication'}
        </Text>
      </View>

      {/* Symptoms */}
      {checkin.symptoms.length > 0 && (
        <View style={s.detailSection}>
          <Text style={s.detailSectionLabel}>Symptoms</Text>
          {checkin.symptoms.map((sym) => (
            <View key={sym} style={s.symptomItem}>
              <Ionicons name="ellipse" size={7} color={colors.primary} />
              <Text style={s.detailSectionText}>{SYMPTOM_LABELS[sym] ?? sym}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tagged word */}
      {taggedWord && (
        <View style={s.detailSection}>
          <Text style={s.detailSectionLabel}>Tagged to</Text>
          <View style={[s.taggedBadge, { backgroundColor: colors.secondary }]}>
            <Ionicons name="bookmark" size={14} color={colors.primary} />
            <Text style={[s.taggedBadgeText, { color: colors.primary }]}>{taggedWord.term}</Text>
          </View>
        </View>
      )}

      {/* Note */}
      {checkin.note && (
        <View style={s.detailSection}>
          <Text style={s.detailSectionLabel}>Note</Text>
          <Text style={s.detailSectionText}>{checkin.note}</Text>
        </View>
      )}

      <View style={{ height: 60 }} />
    </>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      marginBottom: 14,
    },
    filterRow: { flexDirection: 'row', gap: 8 },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.muted,
    },
    filterChipActive: { backgroundColor: colors.primary },
    filterChipText: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    filterChipTextActive: { color: '#fff' },
    list: { paddingHorizontal: 20, paddingBottom: 120 },
    entryCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    entryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    entryIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    entryContent: { flex: 1 },
    entryTitle: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
      marginBottom: 2,
    },
    entryPreview: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    entryDate: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      marginTop: 8,
      marginLeft: 54,
    },
    emptyState: {
      alignItems: 'center',
      paddingTop: 80,
      gap: 12,
      paddingHorizontal: 40,
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
      lineHeight: 21,
    },
    // Modal
    modalContainer: { flex: 1 },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalHeaderLabel: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    detailTitle: {
      fontSize: 24,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      marginTop: 20,
      marginBottom: 4,
    },
    detailDate: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      marginBottom: 20,
    },
    detailSection: { marginBottom: 20 },
    detailSectionLabel: {
      fontSize: 11,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    detailSectionText: {
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
      lineHeight: 24,
    },
    whyCard: { borderRadius: 12, padding: 16 },
    moodDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
    },
    moodDisplayText: {
      fontSize: 22,
      fontFamily: 'Inter_600SemiBold',
    },
    detailChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 16,
      alignSelf: 'flex-start',
    },
    detailChipText: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
    },
    symptomItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },
    taggedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      alignSelf: 'flex-start',
    },
    taggedBadgeText: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
    },
  });
