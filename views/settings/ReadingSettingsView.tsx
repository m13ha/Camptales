import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';

export const ReadingSettingsView: React.FC = () => {
    const { speechRate, setSpeechRate, speechPitch, setSpeechPitch } = useSettings();

    return (
        <div className="max-w-3xl mx-auto space-y-6">
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
    );
};