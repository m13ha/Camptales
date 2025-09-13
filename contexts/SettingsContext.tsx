import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { themes, fonts, fontSizes, Theme } from '../themes';
import type { StoryLayout } from '../layouts';

type FontStyle = keyof typeof fonts;
type FontSize = keyof typeof fontSizes;
export type HistoryRetentionPeriod = '3d' | '7d' | '30d' | 'never';

// Helper to get from localStorage
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
    }
};

// Helper to set to localStorage
const setInLocalStorage = <T,>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
    }
};


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

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState(() => getFromLocalStorage('app-theme', 'cosmicNight'));
  const [fontStyle, setFontStyle] = useState<FontStyle>(() => getFromLocalStorage('app-font-style', 'Sans Serif'));
  const [fontSize, setFontSize] = useState<FontSize>(() => getFromLocalStorage('app-font-size', 'Medium'));
  const [historyRetention, setHistoryRetention] = useState<HistoryRetentionPeriod>(() => getFromLocalStorage('history-retention', '7d'));
  const [speechRate, setSpeechRate] = useState<number>(() => getFromLocalStorage('speech-rate', 1));
  const [speechPitch, setSpeechPitch] = useState<number>(() => getFromLocalStorage('speech-pitch', 1));
  const [storyLayout, setStoryLayout] = useState<StoryLayout>(() => getFromLocalStorage('story-layout', 'classic'));

  const theme = useMemo(() => themes[themeName] || themes.cosmicNight, [themeName]);

  // Effects to persist settings changes to localStorage
  useEffect(() => { setInLocalStorage('app-theme', themeName) }, [themeName]);
  useEffect(() => { setInLocalStorage('app-font-style', fontStyle) }, [fontStyle]);
  useEffect(() => { setInLocalStorage('app-font-size', fontSize) }, [fontSize]);
  useEffect(() => { setInLocalStorage('history-retention', historyRetention) }, [historyRetention]);
  useEffect(() => { setInLocalStorage('speech-rate', speechRate) }, [speechRate]);
  useEffect(() => { setInLocalStorage('speech-pitch', speechPitch) }, [speechPitch]);
  useEffect(() => { setInLocalStorage('story-layout', storyLayout) }, [storyLayout]);

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

  const value = {
    theme,
    setTheme: setThemeName,
    fontStyle,
    setFontStyle,
    fontSize,
    setFontSize,
    historyRetention,
    setHistoryRetention,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    storyLayout,
    setStoryLayout,
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
