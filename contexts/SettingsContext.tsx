import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { themes, fonts, fontSizes, Theme } from '../themes';

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
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useLocalStorage('app-theme', 'cosmicNight');
  const [fontStyle, setFontStyle] = useLocalStorage<FontStyle>('app-font-style', 'Sans Serif');
  const [fontSize, setFontSize] = useLocalStorage<FontSize>('app-font-size', 'Medium');
  const [historyRetention, setHistoryRetention] = useLocalStorage<HistoryRetentionPeriod>('history-retention', '7d');

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

  const value = {
    theme,
    setTheme: setThemeName,
    fontStyle,
    setFontStyle,
    fontSize,
    setFontSize,
    historyRetention,
    setHistoryRetention,
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