import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAppData } from '@/context/AppDataContext';

const MOODS = [
  { value: 1, label: 'Rough', icon: 'emoticon-sad-outline' as const },
  { value: 2, label: 'Low', icon: 'emoticon-frown-outline' as const },
  { value: 3, label: 'Okay', icon: 'emoticon-neutral-outline' as const },
  { value: 4, label: 'Good', icon: 'emoticon-happy-outline' as const },
  { value: 5, label: 'Great', icon: 'emoticon-excited-outline' as const },
];

const MOOD_COLORS = ['#E07A7A', '#D4956A', '#8AA8B8', '#5EB8A0', '#3A9EA5'];

const SYMPTOMS = [
  { id: 'chest_tightness', label: 'Chest tightness', icon: 'heart-outline' },
  { id: 'fatigue', label: 'Fatigue', icon: 'battery-low-outline' },
  { id: 'shortness_of_breath', label: 'Shortness of breath', icon: 'cloud-outline' },
  { id: 'dizziness', label: 'Dizziness', icon: 'sync-circle-outline' },
] as const;

export default function CheckInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addCheckIn, savedWords } = useAppData();

  const [mood, setMood] = useState<number>(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [tookMedication, setTookMedication] = useState(false);
  const [taggedWordId, setTaggedWordId] = useState<string | undefined>(undefined);
  const [note, setNote] = useState('');
  const [wordPickerOpen, setWordPickerOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const taggedWord = savedWords.find((w) => w.id === taggedWordId);

  function toggleSymptom(id: string) {
    Haptics.selectionAsync();
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function selectMood(val: number) {
    Haptics.selectionAsync();
    setMood(val);
  }

  async function handleSave() {
    if (mood === 0) return;
    setSaving(true);
    await addCheckIn({ mood, symptoms, tookMedication, taggedWordId, note });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
    setSaving(false);
    // Reset after short delay
    setTimeout(() => {
      setMood(0);
      setSymptoms([]);
      setTookMedication(false);
      setTaggedWordId(undefined);
      setNote('');
      setSaved(false);
    }, 2000);
  }

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const s = styles(colors);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (saved) {
    return (
      <View style={[s.container, s.successContainer, { paddingTop: topPad }]}>
        <Ionicons name="checkmark-circle" size={72} color={colors.primary} />
        <Text style={s.successTitle}>Check-in saved</Text>
        <Text style={s.successText}>Take care of yourself today.</Text>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.scrollContent}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerDate}>{today}</Text>
          <Text style={s.headerTitle}>How are you today?</Text>
        </View>

        {/* Mood */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Mood</Text>
          <View style={s.moodRow}>
            {MOODS.map((m) => {
              const active = mood === m.value;
              const moodColor = MOOD_COLORS[m.value - 1];
              return (
                <TouchableOpacity
                  key={m.value}
                  style={[
                    s.moodBtn,
                    active && { backgroundColor: moodColor + '20', borderColor: moodColor },
                  ]}
                  onPress={() => selectMood(m.value)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={m.icon}
                    size={32}
                    color={active ? moodColor : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      s.moodLabel,
                      { color: active ? moodColor : colors.mutedForeground },
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {mood === 0 && (
            <Text style={s.hint}>Select your mood to save a check-in</Text>
          )}
        </View>

        {/* Symptoms */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Symptoms</Text>
          <Text style={s.cardSubLabel}>Check any you're experiencing today</Text>
          {SYMPTOMS.map((sym) => {
            const active = symptoms.includes(sym.id);
            return (
              <TouchableOpacity
                key={sym.id}
                style={[s.symptomRow, active && s.symptomRowActive]}
                onPress={() => toggleSymptom(sym.id)}
                activeOpacity={0.7}
              >
                <View style={[s.checkbox, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  {active && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Ionicons
                  name={sym.icon as any}
                  size={20}
                  color={active ? colors.primary : colors.mutedForeground}
                />
                <Text style={[s.symptomLabel, { color: active ? colors.foreground : colors.mutedForeground }]}>
                  {sym.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Medication */}
        <View style={s.card}>
          <View style={s.toggleRow}>
            <View style={s.toggleLeft}>
              <Ionicons name="medical-outline" size={20} color={colors.primary} />
              <Text style={s.cardLabel}>Took medication today</Text>
            </View>
            <Switch
              value={tookMedication}
              onValueChange={(v) => {
                Haptics.selectionAsync();
                setTookMedication(v);
              }}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={tookMedication ? colors.primary : colors.card}
            />
          </View>
        </View>

        {/* Tag to word */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Tag to a saved word</Text>
          <Text style={s.cardSubLabel}>Link this entry to a term in your glossary</Text>
          <TouchableOpacity
            style={[s.wordPicker, { borderColor: taggedWord ? colors.primary : colors.border }]}
            onPress={() => setWordPickerOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="bookmark-outline"
              size={18}
              color={taggedWord ? colors.primary : colors.mutedForeground}
            />
            <Text style={[s.wordPickerText, { color: taggedWord ? colors.foreground : colors.mutedForeground }]}>
              {taggedWord ? taggedWord.term : 'Select a saved word...'}
            </Text>
            {taggedWord ? (
              <TouchableOpacity onPress={() => setTaggedWordId(undefined)}>
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            ) : (
              <Ionicons name="chevron-down" size={18} color={colors.mutedForeground} />
            )}
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Notes</Text>
          <TextInput
            style={[s.noteInput, { borderColor: colors.border, color: colors.foreground }]}
            placeholder="Anything else on your mind today?"
            placeholderTextColor={colors.mutedForeground}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            s.saveBtn,
            {
              backgroundColor: mood > 0 ? colors.primary : colors.muted,
            },
          ]}
          onPress={handleSave}
          disabled={mood === 0 || saving}
          activeOpacity={0.8}
        >
          <Ionicons name="heart" size={20} color={mood > 0 ? '#fff' : colors.mutedForeground} />
          <Text style={[s.saveBtnText, { color: mood > 0 ? '#fff' : colors.mutedForeground }]}>
            Save check-in
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Word Picker Modal */}
      <Modal
        visible={wordPickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setWordPickerOpen(false)}
      >
        <View style={[s.pickerModal, { backgroundColor: colors.background }]}>
          <View style={s.pickerHeader}>
            <Text style={s.pickerTitle}>Saved Words</Text>
            <TouchableOpacity onPress={() => setWordPickerOpen(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.pickerList}>
            <TouchableOpacity
              style={[s.pickerItem, !taggedWordId && s.pickerItemActive]}
              onPress={() => {
                setTaggedWordId(undefined);
                setWordPickerOpen(false);
              }}
            >
              <Text style={[s.pickerItemText, { color: !taggedWordId ? colors.primary : colors.foreground }]}>
                None
              </Text>
              {!taggedWordId && <Ionicons name="checkmark" size={18} color={colors.primary} />}
            </TouchableOpacity>
            {savedWords.length === 0 && (
              <View style={s.pickerEmpty}>
                <Feather name="bookmark" size={36} color={colors.mutedForeground} />
                <Text style={s.pickerEmptyText}>No saved words yet</Text>
                <Text style={s.pickerEmptyHint}>Save terms from the Lookup tab first</Text>
              </View>
            )}
            {savedWords.map((w) => (
              <TouchableOpacity
                key={w.id}
                style={[s.pickerItem, taggedWordId === w.id && s.pickerItemActive]}
                onPress={() => {
                  setTaggedWordId(w.id);
                  setWordPickerOpen(false);
                }}
              >
                <Text style={[s.pickerItemText, { color: taggedWordId === w.id ? colors.primary : colors.foreground }]}>
                  {w.term}
                </Text>
                {taggedWordId === w.id && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    successContainer: { alignItems: 'center', justifyContent: 'center', gap: 12 },
    successTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.foreground },
    successText: { fontSize: 16, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    header: { paddingVertical: 20 },
    headerDate: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardLabel: {
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
      marginBottom: 4,
    },
    cardSubLabel: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      marginBottom: 12,
    },
    hint: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: 8,
    },
    moodRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    moodBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'transparent',
      marginHorizontal: 2,
      gap: 4,
    },
    moodLabel: {
      fontSize: 10,
      fontFamily: 'Inter_500Medium',
    },
    symptomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    symptomRowActive: { backgroundColor: colors.secondary, borderRadius: 10, borderBottomColor: 'transparent', marginHorizontal: -4, paddingHorizontal: 4 },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    symptomLabel: {
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      flex: 1,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    wordPicker: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginTop: 8,
    },
    wordPickerText: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
    },
    noteInput: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      minHeight: 80,
      backgroundColor: colors.background,
      marginTop: 8,
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 16,
      paddingVertical: 17,
      marginTop: 8,
      marginBottom: 40,
    },
    saveBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
    // Picker Modal
    pickerModal: { flex: 1 },
    pickerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerTitle: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    pickerList: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
    pickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerItemActive: { backgroundColor: colors.secondary, borderRadius: 10, paddingHorizontal: 12, borderBottomColor: 'transparent' },
    pickerItemText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
    pickerEmpty: { alignItems: 'center', paddingTop: 60, gap: 10 },
    pickerEmptyText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    pickerEmptyHint: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
  });
