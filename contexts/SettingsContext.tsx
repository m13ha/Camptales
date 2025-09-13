import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { themes, fonts, fontSizes, Theme } from '../themes';
import type { StoryLayout } from '../layouts';
import { useIndexedDB } from '../hooks/useIndexedDB';
import type { AppSetting } from '../types';

type FontStyle = keyof typeof fonts;
type FontSize = keyof typeof fontSizes;
export type HistoryRetentionPeriod = '3d' | '7d' | '30d' | 'never';

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
  storyLayout: StoryLayout;
  setStoryLayout: (layout: StoryLayout) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings = {
  themeName: 'cosmicNight',
  fontStyle: 'Sans Serif' as FontStyle,
  fontSize: 'Medium' as FontSize,
  historyRetention: '7d' as HistoryRetentionPeriod,
  speechRate: 1,
  speechPitch: 1,
  storyLayout: 'classic' as StoryLayout,
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local state for settings, initialized with defaults
  const [themeName, setThemeName] = useState(defaultSettings.themeName);
  const [fontStyle, setFontStyle] = useState<FontStyle>(defaultSettings.fontStyle);
  const [fontSize, setFontSize] = useState<FontSize>(defaultSettings.fontSize);
  const [historyRetention, setHistoryRetention] = useState<HistoryRetentionPeriod>(defaultSettings.historyRetention);
  const [speechRate, setSpeechRate] = useState<number>(defaultSettings.speechRate);
  const [speechPitch, setSpeechPitch] = useState<number>(defaultSettings.speechPitch);
  const [storyLayout, setStoryLayout] = useState<StoryLayout>(defaultSettings.storyLayout);
  
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
          setStoryLayout(settingsMap.get('story-layout') ?? defaultSettings.storyLayout);
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
    const fontId = `font-link-${fontStyle.replace(' ', '-')}`;
    if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        let href = '';
        if(fontStyle === 'Serif') href = 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap';
        if(fontStyle === 'Sans Serif') href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap';
        if(fontStyle === 'Playful') href = 'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap';
        
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
    storyLayout,
    setStoryLayout: createSetter(setStoryLayout, 'story-layout'),
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
