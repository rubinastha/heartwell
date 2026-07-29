import React, { useEffect, useState } from 'react';
import {
  Platform,
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
import { UserProfile, useAppData } from '@/context/AppDataContext';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useAppData();

  const [form, setForm] = useState<UserProfile>(profile);
  const [newMed, setNewMed] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  function updateField<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addMedication() {
    const trimmed = newMed.trim();
    if (!trimmed) return;
    updateField('medications', [...form.medications, trimmed]);
    setNewMed('');
  }

  function removeMedication(idx: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateField(
      'medications',
      form.medications.filter((_, i) => i !== idx),
    );
  }

  async function handleSave() {
    await updateProfile(form);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const s = styles(colors);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.scrollContent}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>My Profile</Text>
          <Text style={s.headerSub}>
            Your information is stored only on this device.
          </Text>
        </View>

        {/* Personal Info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Personal</Text>
          <View style={s.card}>
            <Field
              label="Your name"
              value={form.name}
              onChange={(v) => updateField('name', v)}
              placeholder="e.g. Jane Smith"
              colors={colors}
            />
            <Separator colors={colors} />
            <Field
              label="Condition or diagnosis"
              value={form.condition}
              onChange={(v) => updateField('condition', v)}
              placeholder="e.g. Atrial fibrillation, Heart failure"
              colors={colors}
            />
          </View>
        </View>

        {/* Medications */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Current Medications</Text>
          <View style={s.card}>
            {form.medications.length === 0 && (
              <Text style={[s.emptyMeds, { color: colors.mutedForeground }]}>
                No medications added yet
              </Text>
            )}
            {form.medications.map((med, idx) => (
              <View key={idx} style={s.medRow}>
                <Ionicons name="medical" size={16} color={colors.primary} />
                <Text style={[s.medText, { color: colors.foreground }]}>{med}</Text>
                <TouchableOpacity
                  onPress={() => removeMedication(idx)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            ))}
            {form.medications.length > 0 && <View style={s.separator} />}
            <View style={s.addMedRow}>
              <TextInput
                style={[s.addMedInput, { color: colors.foreground }]}
                placeholder="Add a medication..."
                placeholderTextColor={colors.mutedForeground}
                value={newMed}
                onChangeText={setNewMed}
                returnKeyType="done"
                onSubmitEditing={addMedication}
              />
              <TouchableOpacity
                style={[s.addBtn, { backgroundColor: colors.secondary }]}
                onPress={addMedication}
                disabled={!newMed.trim()}
                activeOpacity={0.7}
              >
                <Feather
                  name="plus"
                  size={18}
                  color={newMed.trim() ? colors.primary : colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Doctor Info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Care Team</Text>
          <View style={s.card}>
            <Field
              label="Doctor's name"
              value={form.doctorName}
              onChange={(v) => updateField('doctorName', v)}
              placeholder="e.g. Dr. Maria Lopez"
              colors={colors}
            />
            <Separator colors={colors} />
            <Field
              label="Phone number"
              value={form.doctorPhone}
              onChange={(v) => updateField('doctorPhone', v)}
              placeholder="e.g. (555) 867-5309"
              keyboardType="phone-pad"
              colors={colors}
            />
            <Separator colors={colors} />
            <Field
              label="Email address"
              value={form.doctorEmail}
              onChange={(v) => updateField('doctorEmail', v)}
              placeholder="e.g. dr.lopez@clinic.com"
              keyboardType="email-address"
              autoCapitalize="none"
              colors={colors}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            s.saveBtn,
            { backgroundColor: saved ? colors.secondary : colors.primary },
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Ionicons
            name={saved ? 'checkmark-circle' : 'save-outline'}
            size={20}
            color={saved ? colors.primary : '#fff'}
          />
          <Text style={[s.saveBtnText, { color: saved ? colors.primary : '#fff' }]}>
            {saved ? 'Profile saved' : 'Save profile'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  autoCapitalize,
  colors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: any;
  autoCapitalize?: any;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={fieldStyles.container}>
      <Text style={[fieldStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, { color: colors.foreground }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        returnKeyType="done"
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { paddingVertical: 4 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  input: { fontSize: 16, fontFamily: 'Inter_400Regular', paddingVertical: 6 },
});

function Separator({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[separatorStyles.line, { backgroundColor: colors.border }]} />
  );
}

const separatorStyles = StyleSheet.create({
  line: { height: 1, marginVertical: 10 },
});

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    header: { paddingVertical: 20 },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      marginBottom: 4,
    },
    headerSub: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    section: { marginBottom: 16 },
    sectionTitle: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
      marginLeft: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyMeds: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      paddingVertical: 12,
      fontStyle: 'italic',
    },
    medRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    medText: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
    },
    separator: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
    addMedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
    },
    addMedInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      padding: 0,
    },
    addBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 16,
      paddingVertical: 17,
      marginTop: 8,
    },
    saveBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  });
