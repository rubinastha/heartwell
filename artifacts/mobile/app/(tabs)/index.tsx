import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAppData } from '@/context/AppDataContext';
import { CardiacTerm, CATEGORY_LABELS, cardiacTerms } from '@/constants/cardiacTerms';

const CATEGORY_COLORS: Record<string, string> = {
  condition: '#5BA4CF',
  medication: '#7BC88A',
  procedure: '#E8A84E',
  test: '#9B89CC',
  symptom: '#E07A7A',
};

type SavePhase = 'idle' | 'note';

export default function LookupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saveWord, removeWord, isWordSaved, getSavedWordByTerm } = useAppData();

  const [query, setQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<CardiacTerm | null>(null);
  const [savePhase, setSavePhase] = useState<SavePhase>('idle');
  const [personalNote, setPersonalNote] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return cardiacTerms;
    const q = query.toLowerCase();
    return cardiacTerms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.explanation.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [query]);

  function openTerm(term: CardiacTerm) {
    setSelectedTerm(term);
    setSavePhase('idle');
    setPersonalNote('');
  }

  function closeTerm() {
    setSelectedTerm(null);
    setSavePhase('idle');
    setPersonalNote('');
  }

  async function handleSave() {
    if (!selectedTerm) return;
    if (savePhase === 'idle') {
      setSavePhase('note');
      return;
    }
    setSaving(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveWord(
      selectedTerm.term,
      selectedTerm.explanation,
      selectedTerm.whyItMatters,
      personalNote,
    );
    setSaving(false);
    setSavePhase('idle');
    setPersonalNote('');
  }

  async function handleRemove() {
    if (!selectedTerm) return;
    const saved = getSavedWordByTerm(selectedTerm.term);
    if (!saved) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await removeWord(saved.id);
  }

  const isSaved = selectedTerm ? isWordSaved(selectedTerm.term) : false;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const s = styles(colors);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Cardiac Glossary</Text>
        <Text style={s.headerSub}>
          {cardiacTerms.length} terms explained in plain language
        </Text>
        <View style={s.searchBar}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            placeholder="Search terms, conditions, medications..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && Platform.OS !== 'ios' && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={s.emptyTitle}>No terms found</Text>
            <Text style={s.emptyText}>Try a different search term</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.termCard}
            onPress={() => openTerm(item)}
            activeOpacity={0.7}
          >
            <View style={s.termCardTop}>
              <Text style={s.termName}>{item.term}</Text>
              {isWordSaved(item.term) && (
                <Ionicons name="bookmark" size={16} color={colors.primary} />
              )}
            </View>
            <View
              style={[
                s.categoryBadge,
                { backgroundColor: CATEGORY_COLORS[item.category] + '20' },
              ]}
            >
              <Text
                style={[
                  s.categoryText,
                  { color: CATEGORY_COLORS[item.category] },
                ]}
              >
                {CATEGORY_LABELS[item.category]}
              </Text>
            </View>
            <Text style={s.termPreview} numberOfLines={2}>
              {item.explanation}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Term Detail Modal */}
      <Modal
        visible={!!selectedTerm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeTerm}
      >
        {selectedTerm && (
          <View style={[s.modalContainer, { backgroundColor: colors.background }]}>
            <View style={s.modalHeader}>
              <TouchableOpacity onPress={closeTerm} style={s.closeBtn}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
              {isSaved && (
                <View style={s.savedBadge}>
                  <Ionicons name="bookmark" size={14} color={colors.primary} />
                  <Text style={[s.savedBadgeText, { color: colors.primary }]}>
                    Saved
                  </Text>
                </View>
              )}
            </View>

            <ScrollView
              style={s.modalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={[
                  s.modalCategoryBadge,
                  {
                    backgroundColor:
                      CATEGORY_COLORS[selectedTerm.category] + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    s.modalCategoryText,
                    { color: CATEGORY_COLORS[selectedTerm.category] },
                  ]}
                >
                  {CATEGORY_LABELS[selectedTerm.category]}
                </Text>
              </View>

              <Text style={s.modalTitle}>{selectedTerm.term}</Text>

              <View style={s.section}>
                <Text style={s.sectionLabel}>What it means</Text>
                <Text style={s.sectionText}>{selectedTerm.explanation}</Text>
              </View>

              <View style={[s.section, s.whyCard]}>
                <View style={s.whyHeader}>
                  <Ionicons
                    name="information-circle"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={[s.sectionLabel, { color: colors.primary }]}>
                    Why this matters
                  </Text>
                </View>
                <Text style={s.sectionText}>{selectedTerm.whyItMatters}</Text>
              </View>

              {isSaved &&
                getSavedWordByTerm(selectedTerm.term)?.personalNote && (
                  <View style={s.section}>
                    <Text style={s.sectionLabel}>Your note</Text>
                    <Text style={s.sectionText}>
                      {getSavedWordByTerm(selectedTerm.term)?.personalNote}
                    </Text>
                  </View>
                )}

              {/* Save / Note Phase */}
              {!isSaved && savePhase === 'note' && (
                <View style={s.noteSection}>
                  <Text style={s.sectionLabel}>Add a personal note (optional)</Text>
                  <TextInput
                    style={[s.noteInput, { borderColor: colors.border, color: colors.foreground }]}
                    placeholder="e.g. this is what my cardiologist told me in March"
                    placeholderTextColor={colors.mutedForeground}
                    value={personalNote}
                    onChangeText={setPersonalNote}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    autoFocus
                  />
                </View>
              )}

              <View style={s.actionRow}>
                {!isSaved ? (
                  <TouchableOpacity
                    style={[s.saveBtn, { backgroundColor: colors.primary }]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="bookmark-outline" size={18} color="#fff" />
                    <Text style={s.saveBtnText}>
                      {savePhase === 'note' ? 'Confirm Save' : 'Save to My Words'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[s.removeBtn, { borderColor: colors.border }]}
                    onPress={handleRemove}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="bookmark"
                      size={18}
                      color={colors.mutedForeground}
                    />
                    <Text style={[s.removeBtnText, { color: colors.mutedForeground }]}>
                      Remove from saved
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      marginBottom: 4,
    },
    headerSub: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      marginBottom: 16,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
      padding: 0,
    },
    list: { paddingHorizontal: 20, paddingBottom: 120 },
    termCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    termCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    termName: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
      flex: 1,
      marginRight: 8,
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginBottom: 8,
    },
    categoryText: {
      fontSize: 11,
      fontFamily: 'Inter_600SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    termPreview: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    emptyState: {
      alignItems: 'center',
      paddingTop: 80,
      gap: 12,
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
    },
    // Modal
    modalContainer: { flex: 1 },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 8,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    savedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.secondary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    savedBadgeText: {
      fontSize: 13,
      fontFamily: 'Inter_600SemiBold',
    },
    modalScroll: { flex: 1, paddingHorizontal: 20 },
    modalCategoryBadge: {
      alignSelf: 'flex-start',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginTop: 8,
      marginBottom: 12,
    },
    modalCategoryText: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    modalTitle: {
      fontSize: 24,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      marginBottom: 24,
      lineHeight: 32,
    },
    section: { marginBottom: 20 },
    sectionLabel: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    sectionText: {
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
      lineHeight: 24,
    },
    whyCard: {
      backgroundColor: colors.secondary,
      borderRadius: 12,
      padding: 16,
    },
    whyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    noteSection: { marginBottom: 16 },
    noteInput: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      minHeight: 80,
      backgroundColor: colors.card,
    },
    actionRow: { paddingBottom: 40, marginTop: 8 },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 14,
      paddingVertical: 16,
    },
    saveBtnText: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: '#fff',
    },
    removeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 14,
      paddingVertical: 16,
      borderWidth: 1,
    },
    removeBtnText: { fontSize: 16, fontFamily: 'Inter_500Medium' },
  });
