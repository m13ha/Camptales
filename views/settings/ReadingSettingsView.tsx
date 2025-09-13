import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Select } from '../../components/ui/Select';

export const ReadingSettingsView: React.FC = () => {
    const { 
        speechRate, setSpeechRate, 
        speechPitch, setSpeechPitch,
        speechVoice, setSpeechVoice
    } = useSettings();
    
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            // Filter for English voices and sort them for a better UX
            const englishVoices = availableVoices
                .filter(voice => voice.lang.startsWith('en'))
                .sort((a, b) => a.name.localeCompare(b.name));
            setVoices(englishVoices);
        };

        // Voices are loaded asynchronously
        loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        };
    }, []);

    const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // An empty string value means we want to use the browser default (null)
        setSpeechVoice(e.target.value === '' ? null : e.target.value);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Select
                id="speech-voice"
                label="Reading Voice"
                value={speechVoice || ''} // Use empty string for null to match the <option> value
                onChange={handleVoiceChange}
                disabled={voices.length === 0}
            >
                <option value="">-- Browser Default --</option>
                {voices.map(voice => (
                    <option key={voice.name} value={voice.name}>
                        {`${voice.name} (${voice.lang})`}
                    </option>
                ))}
            </Select>

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