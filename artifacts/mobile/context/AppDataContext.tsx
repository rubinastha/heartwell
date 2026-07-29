import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedWord {
  id: string;
  term: string;
  explanation: string;
  whyItMatters: string;
  personalNote?: string;
  savedAt: string;
}

export interface CheckIn {
  id: string;
  date: string;
  mood: number;
  symptoms: string[];
  tookMedication: boolean;
  taggedWordId?: string;
  note?: string;
}

export interface UserProfile {
  name: string;
  condition: string;
  medications: string[];
  doctorName: string;
  doctorPhone: string;
  doctorEmail: string;
}

interface AppDataContextType {
  savedWords: SavedWord[];
  checkIns: CheckIn[];
  profile: UserProfile;
  loading: boolean;
  saveWord: (term: string, explanation: string, whyItMatters: string, personalNote?: string) => Promise<void>;
  removeWord: (id: string) => Promise<void>;
  addCheckIn: (data: {
    mood: number;
    symptoms: string[];
    tookMedication: boolean;
    taggedWordId?: string;
    note?: string;
  }) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  isWordSaved: (term: string) => boolean;
  getSavedWordByTerm: (term: string) => SavedWord | undefined;
  getSavedWordById: (id: string) => SavedWord | undefined;
}

const defaultProfile: UserProfile = {
  name: '',
  condition: '',
  medications: [],
  doctorName: '',
  doctorPhone: '',
  doctorEmail: '',
};

const STORAGE_KEYS = {
  savedWords: 'heartwell_saved_words',
  checkIns: 'heartwell_checkins',
  profile: 'heartwell_profile',
};

const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      const [wordsStr, checkInsStr, profileStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.savedWords),
        AsyncStorage.getItem(STORAGE_KEYS.checkIns),
        AsyncStorage.getItem(STORAGE_KEYS.profile),
      ]);
      if (wordsStr) setSavedWords(JSON.parse(wordsStr));
      if (checkInsStr) setCheckIns(JSON.parse(checkInsStr));
      if (profileStr) setProfile(JSON.parse(profileStr));
    } catch {
      // ignore storage errors
    } finally {
      setLoading(false);
    }
  }

  async function saveWord(
    term: string,
    explanation: string,
    whyItMatters: string,
    personalNote?: string,
  ) {
    const newWord: SavedWord = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      term,
      explanation,
      whyItMatters,
      personalNote: personalNote?.trim() || undefined,
      savedAt: new Date().toISOString(),
    };
    const updated = [...savedWords, newWord];
    setSavedWords(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.savedWords, JSON.stringify(updated));
  }

  async function removeWord(id: string) {
    const updated = savedWords.filter((w) => w.id !== id);
    setSavedWords(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.savedWords, JSON.stringify(updated));
  }

  async function addCheckIn(data: {
    mood: number;
    symptoms: string[];
    tookMedication: boolean;
    taggedWordId?: string;
    note?: string;
  }) {
    const newCheckIn: CheckIn = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      mood: data.mood,
      symptoms: data.symptoms,
      tookMedication: data.tookMedication,
      taggedWordId: data.taggedWordId,
      note: data.note?.trim() || undefined,
    };
    const updated = [...checkIns, newCheckIn];
    setCheckIns(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.checkIns, JSON.stringify(updated));
  }

  async function updateProfile(newProfile: UserProfile) {
    setProfile(newProfile);
    await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(newProfile));
  }

  function isWordSaved(term: string): boolean {
    return savedWords.some((w) => w.term.toLowerCase() === term.toLowerCase());
  }

  function getSavedWordByTerm(term: string): SavedWord | undefined {
    return savedWords.find((w) => w.term.toLowerCase() === term.toLowerCase());
  }

  function getSavedWordById(id: string): SavedWord | undefined {
    return savedWords.find((w) => w.id === id);
  }

  return (
    <AppDataContext.Provider
      value={{
        savedWords,
        checkIns,
        profile,
        loading,
        saveWord,
        removeWord,
        addCheckIn,
        updateProfile,
        isWordSaved,
        getSavedWordByTerm,
        getSavedWordById,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextType {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
