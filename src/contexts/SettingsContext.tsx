import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { themes, fonts, fontSizes, Theme } from '../themes';
import type { StoryLayout } from '../layouts';
import { useIndexedDB } from '../hooks/useIndexedDB';
import type { AppSetting } from '../types';

type FontStyle = keyof typeof fonts;
type FontSize = keyof typeof fontSizes;
export type HistoryRetentionPeriod = '3d' | '7d' | '30d' | 'never';
export type TtsEngine = 'ai' | 'browser';

interface SettingsContextType {
  theme: Theme;
  setTheme: (themeName: string) => void;
  fontStyle: FontStyle;
  setFontStyle: (font: FontStyle) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  historyRetention: HistoryRetentionPeriod;
  setHistoryRetention: (period: HistoryRetentionPeriod) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  speechPitch: number;
  setSpeechPitch: (pitch: number) => void;
  speechVoice: string | null;
  setSpeechVoice: (voiceName: string | null) => void;
  storyLayout: StoryLayout;
  setStoryLayout: (layout: StoryLayout) => void;
  ttsEngine: TtsEngine;
  setTtsEngine: (engine: TtsEngine) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings = {
  themeName: 'cosmicNight',
  fontStyle: 'Inter' as FontStyle,
  fontSize: 'Medium' as FontSize,
  historyRetention: '7d' as HistoryRetentionPeriod,
  speechRate: 1,
  speechPitch: 1,
  speechVoice: null as string | null,
  storyLayout: 'classic' as StoryLayout,
  ttsEngine: 'browser' as TtsEngine,
};

const fontGoogleLinks: Record<string, string> = {
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
    'Lora': 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap',
    'Comic Neue': 'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap',
    'Nunito': 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap',
    'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
    'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap',
    'Roboto Slab': 'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&display=swap',
    'Merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
    'Indie Flower': 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap',
    'Patrick Hand': 'https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap',
    'Caveat': 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap',
    'Quicksand': 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap',
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local state for settings, initialized with defaults
  const [themeName, setThemeName] = useState(defaultSettings.themeName);
  const [fontStyle, setFontStyle] = useState<FontStyle>(defaultSettings.fontStyle);
  const [fontSize, setFontSize] = useState<FontSize>(defaultSettings.fontSize);
  const [historyRetention, setHistoryRetention] = useState<HistoryRetentionPeriod>(defaultSettings.historyRetention);
  const [speechRate, setSpeechRate] = useState<number>(defaultSettings.speechRate);
  const [speechPitch, setSpeechPitch] = useState<number>(defaultSettings.speechPitch);
  const [speechVoice, setSpeechVoice] = useState<string | null>(defaultSettings.speechVoice);
  const [storyLayout, setStoryLayout] = useState<StoryLayout>(defaultSettings.storyLayout);
  const [ttsEngine, setTtsEngine] = useState<TtsEngine>(defaultSettings.ttsEngine);
  
  // Hook to interact with the 'settings' store in IndexedDB
  const { data: settingsFromDB, addItem: saveSettingToDB, loading: settingsLoading } = useIndexedDB<AppSetting>('settings');

  // Effect to load settings from DB and update state
  useEffect(() => {
      if (!settingsLoading && settingsFromDB) {
          const settingsMap = new Map(settingsFromDB.map(s => [s.id, s.value]));
          setThemeName(settingsMap.get('app-theme') ?? defaultSettings.themeName);
          setFontStyle(settingsMap.get('app-font-style') ?? defaultSettings.fontStyle);
          setFontSize(settingsMap.get('app-font-size') ?? defaultSettings.fontSize);
          setHistoryRetention(settingsMap.get('history-retention') ?? defaultSettings.historyRetention);
          setSpeechRate(settingsMap.get('speech-rate') ?? defaultSettings.speechRate);
          setSpeechPitch(settingsMap.get('speech-pitch') ?? defaultSettings.speechPitch);
          setSpeechVoice(settingsMap.get('speech-voice') ?? defaultSettings.speechVoice);
          setStoryLayout(settingsMap.get('story-layout') ?? defaultSettings.storyLayout);
          setTtsEngine(settingsMap.get('tts-engine') ?? defaultSettings.ttsEngine);
      }
  }, [settingsFromDB, settingsLoading]);

  const theme = useMemo(() => themes[themeName] || themes.cosmicNight, [themeName]);

  useEffect(() => {
    const root = document.documentElement;

    // Apply colors
    for (const [key, value] of Object.entries(theme.colors)) {
      root.style.setProperty(key, value);
    }

    // Apply font family and size
    root.style.setProperty('--font-family', fonts[fontStyle]);
    root.style.setProperty('--font-size-base', fontSizes[fontSize]);
    
    // Add Google Fonts link if not present
    const fontId = `font-link-${fontStyle.replace(/\s+/g, '-')}`;
    if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        const href = fontGoogleLinks[fontStyle];
        
        if (href) {
            link.href = href;
            document.head.appendChild(link);
        }
    }
  }, [theme, fontStyle, fontSize]);

  // Generic setter function to update state and DB
  const createSetter = useCallback(<T,>(
    stateSetter: React.Dispatch<React.SetStateAction<T>>,
    settingKey: string
  ) => {
      return (newValue: T) => {
          stateSetter(newValue);
          saveSettingToDB({ id: settingKey, value: newValue });
      };
  }, [saveSettingToDB]);

  const value = {
    theme,
    setTheme: createSetter(setThemeName, 'app-theme'),
    fontStyle,
    setFontStyle: createSetter(setFontStyle, 'app-font-style'),
    fontSize,
    setFontSize: createSetter(setFontSize, 'app-font-size'),
    historyRetention,
    setHistoryRetention: createSetter(setHistoryRetention, 'history-retention'),
    speechRate,
    setSpeechRate: createSetter(setSpeechRate, 'speech-rate'),
    speechPitch,
    setSpeechPitch: createSetter(setSpeechPitch, 'speech-pitch'),
    speechVoice,
    setSpeechVoice: createSetter(setSpeechVoice, 'speech-voice'),
    storyLayout,
    setStoryLayout: createSetter(setStoryLayout, 'story-layout'),
    ttsEngine,
    setTtsEngine: createSetter(setTtsEngine, 'tts-engine'),
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
