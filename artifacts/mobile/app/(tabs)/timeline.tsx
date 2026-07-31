import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { exportHealthSummaryPDF } from '@/utils/exportSummary';
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

const ALL_SYMPTOMS = [
  { key: 'chest_tightness', label: 'Chest tightness' },
  { key: 'fatigue', label: 'Fatigue' },
  { key: 'shortness_of_breath', label: 'Shortness of breath' },
  { key: 'dizziness', label: 'Dizziness' },
];

const SYMPTOM_LABELS: Record<string, string> = {
  chest_tightness: 'Chest tightness',
  fatigue: 'Fatigue',
  shortness_of_breath: 'Shortness of breath',
  dizziness: 'Dizziness',
};

// ─── Summary constants ────────────────────────────────────────────────────────
type Range = 7 | 30 | 90;
const RANGES: Range[] = [7, 30, 90];
const SYMPTOM_KEYS = ['chest_tightness', 'fatigue', 'shortness_of_breath', 'dizziness'];
const SYMPTOM_LABELS_SUMMARY: Record<string, string> = {
  chest_tightness: 'Chest tightness',
  fatigue: 'Fatigue',
  shortness_of_breath: 'Short. of breath',
  dizziness: 'Dizziness',
};
const SUMMARY_MOOD_COLORS = ['', '#E07A7A', '#D4956A', '#8AA8B8', '#5EB8A0', '#3A9EA5'];
const SUMMARY_MOOD_LABELS = ['', 'Rough', 'Low', 'Okay', 'Good', 'Great'];

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

function getSummaryMoodColor(avg: number): string {
  if (avg <= 0) return '#8AA8B8';
  return SUMMARY_MOOD_COLORS[Math.max(1, Math.min(5, Math.round(avg)))];
}

function getAdherenceColor(pct: number, colors: ReturnType<typeof useColors>): string {
  if (pct >= 80) return colors.primary;
  if (pct >= 50) return '#D4956A';
  return '#E07A7A';
}

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
  const { savedWords, checkIns, getSavedWordById, removeWord, removeCheckIn } = useAppData();

  const [activeView, setActiveView] = useState<'feed' | 'summary'>('feed');
  const [filter, setFilter] = useState<Filter>('all');
  const [detail, setDetail] = useState<TimelineEntry | null>(null);

  // Keep detail in sync after edits
  const refreshDetail = useCallback((entry: TimelineEntry) => {
    setDetail(entry);
  }, []);

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

  const handleDelete = useCallback(
    (item: TimelineEntry) => {
      const label = item.type === 'word' ? 'saved word' : 'check-in';
      Alert.alert(
        `Delete ${label}?`,
        `This ${label} will be permanently removed.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              if (item.type === 'word') removeWord(item.data.id);
              else removeCheckIn(item.data.id);
            },
          },
        ],
      );
    },
    [removeWord, removeCheckIn],
  );

  // Close open swipeables when another opens
  const openSwipeableRef = useRef<Swipeable | null>(null);

  const renderRightActions = useCallback(
    (item: TimelineEntry) => (
      <TouchableOpacity
        style={s.swipeDeleteBtn}
        onPress={() => handleDelete(item)}
        activeOpacity={0.8}
      >
        <Feather name="trash-2" size={22} color="#fff" />
        <Text style={s.swipeDeleteText}>Delete</Text>
      </TouchableOpacity>
    ),
    [handleDelete, s],
  );

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Timeline</Text>

        {/* Feed / Summary pill toggle */}
        <View style={s.viewToggle}>
          {(['feed', 'summary'] as const).map((v) => (
            <TouchableOpacity
              key={v}
              style={[s.viewToggleBtn, activeView === v && s.viewToggleBtnActive]}
              onPress={() => setActiveView(v)}
              activeOpacity={0.8}
            >
              <Text style={[s.viewToggleBtnText, activeView === v && s.viewToggleBtnTextActive]}>
                {v === 'feed' ? 'Feed' : 'Summary'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeView === 'feed' && (
          <View style={[s.filterRow, { marginTop: 12 }]}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[s.filterChip, filter === f.key && s.filterChipActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[s.filterChipText, filter === f.key && s.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {activeView === 'feed' ? (
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
            <Swipeable
              ref={(ref) => {
                if (ref) {
                  // track for closing
                }
              }}
              onSwipeableWillOpen={() => {
                openSwipeableRef.current?.close();
              }}
              renderRightActions={() => renderRightActions(item)}
              rightThreshold={60}
              overshootRight={false}
              containerStyle={{ marginBottom: 10 }}
            >
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
            </Swipeable>
          )}
        />
      ) : (
        <SummaryPanel colors={colors} />
      )}

      {/* Detail Modal */}
      <Modal
        visible={!!detail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetail(null)}
      >
        {detail && (
          <DetailModal
            detail={detail}
            colors={colors}
            getSavedWordById={getSavedWordById}
            onClose={() => setDetail(null)}
            onDelete={(item) => {
              setDetail(null);
              handleDelete(item);
            }}
          />
        )}
      </Modal>
    </View>
  );
}

// ─── Detail Modal ────────────────────────────────────────────────────────────

function DetailModal({
  detail,
  colors,
  getSavedWordById,
  onClose,
  onDelete,
}: {
  detail: TimelineEntry;
  colors: ReturnType<typeof useColors>;
  getSavedWordById: (id: string) => SavedWord | undefined;
  onClose: () => void;
  onDelete: (item: TimelineEntry) => void;
}) {
  const [editing, setEditing] = useState(false);
  const s = styles(colors);

  return (
    <View style={[s.modalContainer, { backgroundColor: colors.background }]}>
      <View style={s.modalHeader}>
        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.modalHeaderLabel}>
          {detail.type === 'word' ? 'Saved Word' : 'Check-in'}
        </Text>
        <View style={s.modalHeaderActions}>
          {!editing && (
            <TouchableOpacity
              style={s.modalActionBtn}
              onPress={() => setEditing(true)}
            >
              <Feather name="edit-2" size={17} color={colors.primary} />
            </TouchableOpacity>
          )}
          {!editing && (
            <TouchableOpacity
              style={[s.modalActionBtn, { backgroundColor: '#E07A7A18' }]}
              onPress={() => onDelete(detail)}
            >
              <Feather name="trash-2" size={17} color="#E07A7A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        {detail.type === 'word' ? (
          editing ? (
            <WordEditForm
              word={detail.data as SavedWord}
              colors={colors}
              onSave={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <WordDetail word={detail.data as SavedWord} colors={colors} />
          )
        ) : editing ? (
          <CheckInEditForm
            checkin={detail.data as CheckIn}
            colors={colors}
            onSave={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <CheckInDetail
            checkin={detail.data as CheckIn}
            colors={colors}
            getWordById={getSavedWordById}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ─── Word Edit Form ──────────────────────────────────────────────────────────

function WordEditForm({
  word,
  colors,
  onSave,
  onCancel,
}: {
  word: SavedWord;
  colors: ReturnType<typeof useColors>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { updateSavedWordNote } = useAppData();
  const [note, setNote] = useState(word.personalNote ?? '');
  const [saving, setSaving] = useState(false);
  const s = styles(colors);

  const handleSave = async () => {
    setSaving(true);
    await updateSavedWordNote(word.id, note || undefined);
    setSaving(false);
    onSave();
  };

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

      <View style={s.detailSection}>
        <Text style={s.detailSectionLabel}>Your note</Text>
        <TextInput
          style={[s.editTextInput, { minHeight: 100 }]}
          value={note}
          onChangeText={setNote}
          placeholder="Add a personal note…"
          placeholderTextColor={colors.mutedForeground}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={s.editActions}>
        <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
          <Text style={s.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 60 }} />
    </>
  );
}

// ─── Check-in Edit Form ──────────────────────────────────────────────────────

function CheckInEditForm({
  checkin,
  colors,
  onSave,
  onCancel,
}: {
  checkin: CheckIn;
  colors: ReturnType<typeof useColors>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { updateCheckIn } = useAppData();
  const [mood, setMood] = useState(checkin.mood);
  const [symptoms, setSymptoms] = useState<string[]>(checkin.symptoms);
  const [tookMedication, setTookMedication] = useState(checkin.tookMedication);
  const [note, setNote] = useState(checkin.note ?? '');
  const [saving, setSaving] = useState(false);
  const s = styles(colors);

  const toggleSymptom = (key: string) => {
    setSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCheckIn(checkin.id, { mood, symptoms, tookMedication, note: note || undefined });
    setSaving(false);
    onSave();
  };

  return (
    <>
      <Text style={s.detailTitle}>Edit Check-in</Text>
      <Text style={s.detailDate}>{formatFullDate(checkin.date)}</Text>

      {/* Mood */}
      <View style={s.editSection}>
        <Text style={s.detailSectionLabel}>How were you feeling?</Text>
        <View style={s.moodRow}>
          {[1, 2, 3, 4, 5].map((m) => {
            const mc = MOOD_COLORS[m];
            const active = mood === m;
            return (
              <TouchableOpacity
                key={m}
                style={[
                  s.moodBtn,
                  active && { backgroundColor: mc + '22', borderColor: mc },
                ]}
                onPress={() => setMood(m)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={MOOD_ICONS[m] as any}
                  size={28}
                  color={active ? mc : colors.mutedForeground}
                />
                <Text style={[s.moodBtnLabel, active && { color: mc }]}>
                  {MOOD_LABELS[m]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Medication */}
      <View style={s.editSection}>
        <Text style={s.detailSectionLabel}>Medication</Text>
        <TouchableOpacity
          style={[
            s.toggleRow,
            { backgroundColor: tookMedication ? colors.secondary : colors.muted },
          ]}
          onPress={() => setTookMedication((v) => !v)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={tookMedication ? 'medical' : 'medical-outline'}
            size={18}
            color={tookMedication ? colors.primary : colors.mutedForeground}
          />
          <Text
            style={[
              s.toggleRowText,
              { color: tookMedication ? colors.primary : colors.mutedForeground },
            ]}
          >
            {tookMedication ? 'Took medication' : 'Did not take medication'}
          </Text>
          <View style={{ flex: 1 }} />
          <View
            style={[
              s.toggleKnob,
              tookMedication
                ? { backgroundColor: colors.primary, alignSelf: 'flex-end' }
                : { backgroundColor: colors.mutedForeground },
            ]}
          >
            <Feather name={tookMedication ? 'check' : 'x'} size={12} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Symptoms */}
      <View style={s.editSection}>
        <Text style={s.detailSectionLabel}>Symptoms</Text>
        <View style={s.symptomGrid}>
          {ALL_SYMPTOMS.map(({ key, label }) => {
            const active = symptoms.includes(key);
            return (
              <TouchableOpacity
                key={key}
                style={[
                  s.symptomChip,
                  active && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => toggleSymptom(key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.symptomChipText,
                    active && { color: '#fff' },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Note */}
      <View style={s.editSection}>
        <Text style={s.detailSectionLabel}>Note</Text>
        <TextInput
          style={[s.editTextInput, { minHeight: 90 }]}
          value={note}
          onChangeText={setNote}
          placeholder="Add a note…"
          placeholderTextColor={colors.mutedForeground}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={s.editActions}>
        <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
          <Text style={s.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 60 }} />
    </>
  );
}

// ─── Read-only sub-components ────────────────────────────────────────────────

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

      {word.personalNote ? (
        <View style={s.detailSection}>
          <Text style={s.detailSectionLabel}>Your note</Text>
          <Text style={s.detailSectionText}>{word.personalNote}</Text>
        </View>
      ) : (
        <View style={s.detailSection}>
          <Text style={[s.detailSectionLabel]}>Your note</Text>
          <Text style={[s.detailSectionText, { color: colors.mutedForeground, fontStyle: 'italic' }]}>
            No note yet — tap the edit button to add one.
          </Text>
        </View>
      )}

      <View style={{ height: 60 }} />
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

// ─── Summary Panel ───────────────────────────────────────────────────────────

function SummaryPanel({ colors }: { colors: ReturnType<typeof useColors> }) {
  const { checkIns, savedWords, profile } = useAppData();
  const [range, setRange] = useState<Range>(7);
  const [exporting, setExporting] = useState(false);
  const s = styles(colors);

  const stats = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    cutoff.setHours(0, 0, 0, 0);
    const filtered = checkIns.filter((c) => new Date(c.date).getTime() >= cutoff.getTime());
    const totalCheckIns = filtered.length;
    const tookMedDays = filtered.filter((c) => c.tookMedication).length;
    const adherence = totalCheckIns > 0 ? Math.round((tookMedDays / totalCheckIns) * 100) : 0;
    const avgMood =
      filtered.length > 0
        ? filtered.reduce((sum, c) => sum + c.mood, 0) / filtered.length
        : 0;
    const symptomCounts: Record<string, number> = {};
    SYMPTOM_KEYS.forEach((k) => (symptomCounts[k] = 0));
    filtered.forEach((c) => {
      c.symptoms.forEach((sym) => {
        if (sym in symptomCounts) symptomCounts[sym]++;
      });
    });
    const days = getDaysArray(range);
    const moodByDay = days.map((day) => {
      const dayCheckins = filtered.filter((c) => isSameDay(new Date(c.date), day));
      if (dayCheckins.length === 0) return null;
      return Math.round(dayCheckins.reduce((sum, c) => sum + c.mood, 0) / dayCheckins.length);
    });
    return { totalCheckIns, adherence, avgMood, symptomCounts, moodByDay, days, filtered };
  }, [checkIns, range]);

  const hasData = stats.totalCheckIns > 0;

  async function handleExport() {
    if (!hasData) return;
    setExporting(true);
    try {
      await exportHealthSummaryPDF(stats, savedWords, profile, range);
    } catch (err: any) {
      Alert.alert('Export failed', err?.message ?? 'Could not generate the report.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.summaryContent}>
      {/* Range + export row */}
      <View style={s.summaryTopRow}>
        <View style={s.rangeRow}>
          {RANGES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[s.rangeChip, range === r && s.rangeChipActive]}
              onPress={() => setRange(r)}
              activeOpacity={0.7}
            >
              <Text style={[s.rangeChipText, range === r && s.rangeChipTextActive]}>
                {r}d
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {hasData && (
          <TouchableOpacity
            style={[s.exportBtn, exporting && { opacity: 0.6 }]}
            onPress={handleExport}
            activeOpacity={0.7}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Feather name="share" size={13} color="#fff" />
                <Text style={s.exportBtnText}>Export PDF</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {!hasData ? (
        <View style={s.emptyState}>
          <Feather name="bar-chart-2" size={40} color={colors.mutedForeground} />
          <Text style={s.emptyTitle}>No check-ins yet</Text>
          <Text style={s.emptyText}>Log daily check-ins to see your trends and stats here.</Text>
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
              <Text style={[s.overviewValue, { color: getSummaryMoodColor(stats.avgMood) }]}>
                {stats.avgMood > 0 ? SUMMARY_MOOD_LABELS[Math.round(stats.avgMood)] : '—'}
              </Text>
              <Text style={s.overviewLabel}>Avg. Mood</Text>
            </View>
          </View>

          {/* Medication adherence */}
          <View style={s.summaryCard}>
            <View style={s.cardTitleRow}>
              <Ionicons name="medical-outline" size={17} color={colors.primary} />
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
          <View style={s.summaryCard}>
            <View style={s.cardTitleRow}>
              <Ionicons name="trending-up-outline" size={17} color={colors.primary} />
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
                            backgroundColor: SUMMARY_MOOD_COLORS[mood],
                          },
                        ]}
                      />
                    ) : (
                      <View style={s.moodBarEmpty} />
                    )}
                  </View>
                  {(range === 7 || i % Math.ceil(range / 7) === 0) && (
                    <Text style={s.moodDayLabel}>{stats.days[i].getDate()}</Text>
                  )}
                </View>
              ))}
            </View>
            <View style={s.moodLegend}>
              {[1, 3, 5].map((m) => (
                <View key={m} style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: SUMMARY_MOOD_COLORS[m] }]} />
                  <Text style={s.legendText}>{SUMMARY_MOOD_LABELS[m]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Symptom frequency */}
          <View style={s.summaryCard}>
            <View style={s.cardTitleRow}>
              <Ionicons name="pulse-outline" size={17} color={colors.primary} />
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
                  <Text style={s.symptomBarLabel}>{SYMPTOM_LABELS_SUMMARY[key]}</Text>
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
            <Text style={s.adherenceCaption}>% of check-ins where symptom was reported</Text>
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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
    // Swipe delete
    swipeDeleteBtn: {
      backgroundColor: '#E07A7A',
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      borderRadius: 14,
      marginLeft: 8,
    },
    swipeDeleteText: {
      color: '#fff',
      fontSize: 11,
      fontFamily: 'Inter_500Medium',
      marginTop: 4,
    },
    entryCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
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
    modalHeaderActions: {
      flexDirection: 'row',
      gap: 8,
    },
    modalActionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
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
    // Edit form
    editSection: { marginBottom: 24 },
    editTextInput: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    moodRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 6,
    },
    moodBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.muted,
      gap: 4,
    },
    moodBtnLabel: {
      fontSize: 10,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    toggleRowText: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
    },
    toggleKnob: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    symptomGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    symptomChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.muted,
    },
    symptomChipText: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    editActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.muted,
      alignItems: 'center',
    },
    cancelBtnText: {
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
    },
    saveBtn: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    saveBtnText: {
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
      color: '#fff',
    },
    // Feed/Summary toggle
    viewToggle: {
      flexDirection: 'row',
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 4,
    },
    viewToggleBtn: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 9,
      alignItems: 'center',
    },
    viewToggleBtnActive: {
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    viewToggleBtnText: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    viewToggleBtnTextActive: {
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    // Summary panel
    summaryContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 14 },
    summaryTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    rangeRow: { flexDirection: 'row', gap: 6 },
    rangeChip: {
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.muted,
    },
    rangeChipActive: { backgroundColor: colors.primary },
    rangeChipText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground },
    rangeChipTextActive: { color: '#fff' },
    exportBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    exportBtnText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#fff' },
    overviewRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    overviewCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    overviewValue: { fontSize: 26, fontFamily: 'Inter_700Bold', color: colors.foreground },
    overviewLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, marginTop: 4 },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    cardTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    bigPercent: { fontSize: 40, fontFamily: 'Inter_700Bold', marginBottom: 10 },
    progressTrack: {
      height: 10,
      backgroundColor: colors.muted,
      borderRadius: 5,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: { height: '100%', borderRadius: 5 },
    adherenceCaption: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
    moodTrendChart: { flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 3, marginBottom: 10 },
    moodDayColumn: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
    moodBarContainer: { flex: 1, width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
    moodBar: { width: '80%', borderRadius: 3, minHeight: 4 },
    moodBarEmpty: { width: '80%', height: 4, backgroundColor: colors.muted, borderRadius: 3 },
    moodDayLabel: { fontSize: 9, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginTop: 3 },
    moodLegend: { flexDirection: 'row', gap: 14 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
    symptomBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    symptomBarLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.foreground, width: 96 },
    symptomTrack: { flex: 1, height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: 'hidden' },
    symptomFill: { height: '100%', borderRadius: 4 },
    symptomPct: { fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, width: 32, textAlign: 'right' },
  });
