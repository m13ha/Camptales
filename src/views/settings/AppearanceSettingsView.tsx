import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { themes } from '../../themes';
import { storyLayouts, StoryLayout } from '../../layouts';

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

export const AppearanceSettingsView: React.FC = () => {
    const { theme, setTheme, storyLayout, setStoryLayout } = useSettings();

    return (
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
        </div>
    );
};