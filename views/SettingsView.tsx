import React from 'react';
import { useSettings, HistoryRetentionPeriod } from '../contexts/SettingsContext';
import { themes, fonts, fontSizes } from '../themes';

const retentionOptions: { value: HistoryRetentionPeriod, label: string }[] = [
    { value: '3d', label: '3 days' },
    { value: '7d', label: '1 week' },
    { value: '30d', label: '1 month' },
    { value: 'never', label: 'Never' },
];

export const SettingsView: React.FC = () => {
  const { theme, setTheme, fontStyle, setFontStyle, fontSize, setFontSize, historyRetention, setHistoryRetention } = useSettings();

  return (
    <div>
        <div className="space-y-8 max-w-3xl mx-auto">
            <div>
                <h3 className="font-bold text-[--text-primary] mb-4">Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                    {Object.values(themes).map(t => (
                        <button
                            key={t.name}
                            onClick={() => setTheme(Object.keys(themes).find(key => themes[key] === t)!)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                theme.name === t.name ? 'border-[--primary]' : 'border-[--border]'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-[--text-primary]">{t.name}</span>
                                {t.mode === 'dark' ? '🌙' : '☀️'}
                            </div>
                            <div className="flex space-x-2 h-8 rounded" style={{ backgroundColor: t.colors['--background'] }}>
                                <div className="w-1/4 rounded-l" style={{backgroundColor: t.colors['--primary']}}></div>
                                <div className="w-1/4" style={{backgroundColor: t.colors['--text-primary']}}></div>
                                <div className="w-1/4" style={{backgroundColor: t.colors['--text-secondary']}}></div>
                                <div className="w-1/4 rounded-r" style={{backgroundColor: t.colors['--card-background']}}></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-bold text-[--text-primary] mb-4">Typography</h3>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="font-style" className="block mb-2 text-sm font-medium text-[--text-secondary]">Font Style</label>
                        <select
                            id="font-style"
                            value={fontStyle}
                            onChange={(e) => setFontStyle(e.target.value as keyof typeof fonts)}
                            className="w-full px-4 py-2.5 bg-[--input-background] border-2 border-[--border] rounded-lg text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--primary] focus:border-[--primary]"
                        >
                            {Object.keys(fonts).map(fontName => (
                                <option key={fontName} value={fontName}>{fontName}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="font-size" className="block mb-2 text-sm font-medium text-[--text-secondary]">Text Size</label>
                        <select
                            id="font-size"
                            value={fontSize}
                            onChange={(e) => setFontSize(e.target.value as keyof typeof fontSizes)}
                            className="w-full px-4 py-2.5 bg-[--input-background] border-2 border-[--border] rounded-lg text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--primary] focus:border-[--primary]"
                        >
                            {Object.keys(fontSizes).map(sizeName => (
                                <option key={sizeName} value={sizeName}>{sizeName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-[--text-primary] mb-4">History Settings</h2>
                <div>
                    <label htmlFor="history-retention" className="block mb-2 text-sm font-medium text-[--text-secondary]">
                        Automatically delete stories from history after
                    </label>
                    <select
                        id="history-retention"
                        value={historyRetention}
                        onChange={(e) => setHistoryRetention(e.target.value as HistoryRetentionPeriod)}
                        className="w-full px-4 py-2.5 bg-[--input-background] border-2 border-[--border] rounded-lg text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--primary] focus:border-[--primary]"
                    >
                        {retentionOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    </div>
  );
};