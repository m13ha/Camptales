import React from 'react';
import { useSettings, HistoryRetentionPeriod } from '../contexts/SettingsContext';
import { themes, fonts, fontSizes } from '../themes';
import { storyLayouts, StoryLayout } from '../layouts';
import { Select } from '../components/ui/Select';

const retentionOptions: { value: HistoryRetentionPeriod, label: string }[] = [
    { value: '3d', label: '3 days' },
    { value: '7d', label: '1 week' },
    { value: '30d', label: '1 month' },
    { value: 'never', label: 'Never' },
];

const LayoutPreview: React.FC<{ layout: StoryLayout }> = ({ layout }) => {
    if (layout === 'classic') {
        return <div className="h-12 w-full flex items-center gap-2 rounded bg-[--input-background] p-2"><div className="w-1/2 h-full rounded bg-[--primary]/50"></div><div className="w-1/2 h-full space-y-1"><div className="h-1/4 w-full rounded bg-[--text-secondary]/50"></div><div className="h-1/4 w-3/4 rounded bg-[--text-secondary]/50"></div></div></div>;
    }
     if (layout === 'cinematic') {
        return <div className="h-12 w-full flex flex-col items-center gap-1 rounded bg-[--input-background] p-2"><div className="w-full h-1/2 rounded bg-[--primary]/50"></div><div className="w-full h-1/2 space-y-1"><div className="h-1/2 w-full rounded bg-[--text-secondary]/50"></div></div></div>;
    }
     if (layout === 'portrait') {
        return <div className="h-12 w-full flex items-center gap-2 rounded bg-[--input-background] p-2"><div className="w-1/3 h-full rounded bg-[--primary]/50"></div><div className="w-2/3 h-full space-y-1"><div className="h-1/4 w-full rounded bg-[--text-secondary]/50"></div><div className="h-1/4 w-3/4 rounded bg-[--text-secondary]/50"></div></div></div>;
    }
    if (layout === 'full-page') {
        return <div className="h-12 w-full relative rounded bg-[--input-background] p-2"><div className="absolute inset-0 bg-[--primary]/50 rounded"></div><div className="absolute bottom-2 left-2 right-2 h-1/3 rounded bg-black/30 p-1 space-y-1"><div className="h-1/3 w-full rounded bg-white/50"></div><div className="h-1/3 w-3/4 rounded bg-white/50"></div></div></div>
    }
    return null;
}


export const SettingsView: React.FC = () => {
  const { 
      theme, setTheme, 
      fontStyle, setFontStyle, 
      fontSize, setFontSize, 
      historyRetention, setHistoryRetention,
      speechRate, setSpeechRate,
      speechPitch, setSpeechPitch,
      storyLayout, setStoryLayout
    } = useSettings();

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
                <h3 className="font-bold text-[--text-primary] mb-4">Story Layout</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(storyLayouts).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setStoryLayout(key as StoryLayout)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                                storyLayout === key ? 'border-[--primary] ring-2 ring-[--primary]/50' : 'border-[--border] hover:border-[--primary]/50'
                            }`}
                        >
                            <LayoutPreview layout={key as StoryLayout} />
                            <div className="mt-2">
                                <span className="font-semibold text-[--text-primary]">{config.name}</span>
                                <p className="text-sm text-[--text-secondary]">{config.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-bold text-[--text-primary] mb-4">Typography</h3>
                <div className="space-y-6">
                    <Select
                        id="font-style"
                        label="Font Style"
                        value={fontStyle}
                        onChange={(e) => setFontStyle(e.target.value as keyof typeof fonts)}
                    >
                        {Object.keys(fonts).map(fontName => (
                            <option key={fontName} value={fontName}>{fontName}</option>
                        ))}
                    </Select>
                     <Select
                        id="font-size"
                        label="Text Size"
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value as keyof typeof fontSizes)}
                    >
                        {Object.keys(fontSizes).map(sizeName => (
                            <option key={sizeName} value={sizeName}>{sizeName}</option>
                        ))}
                    </Select>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-[--text-primary] mb-4">Speech Settings</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="speech-rate" className="flex justify-between mb-2 text-sm font-medium text-[--text-secondary]">
                            <span>Speech Rate</span>
                            <span>{speechRate.toFixed(1)}x</span>
                        </label>
                        <input
                            type="range"
                            id="speech-rate"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={speechRate}
                            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                            className="w-full h-2 bg-[--input-background] rounded-lg appearance-none cursor-pointer accent-[--primary]"
                        />
                    </div>
                     <div>
                        <label htmlFor="speech-pitch" className="flex justify-between mb-2 text-sm font-medium text-[--text-secondary]">
                            <span>Speech Pitch</span>
                            <span>{speechPitch.toFixed(1)}</span>
                        </label>
                         <input
                            type="range"
                            id="speech-pitch"
                            min="0"
                            max="2"
                            step="0.1"
                            value={speechPitch}
                            onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                            className="w-full h-2 bg-[--input-background] rounded-lg appearance-none cursor-pointer accent-[--primary]"
                        />
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-[--text-primary] mb-4">History Settings</h2>
                <Select
                    id="history-retention"
                    label="Automatically delete stories from history after"
                    value={historyRetention}
                    onChange={(e) => setHistoryRetention(e.target.value as HistoryRetentionPeriod)}
                >
                    {retentionOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </Select>
            </div>
        </div>
    </div>
  );
};
