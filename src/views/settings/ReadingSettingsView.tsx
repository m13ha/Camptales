import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { generateSpeech } from '../../services/ttsService';
import { premiumVoices } from '../../voices';

export const ReadingSettingsView: React.FC = () => {
    const { 
        speechRate, setSpeechRate, 
        speechPitch, setSpeechPitch,
        speechVoice, setSpeechVoice,
        ttsEngine, setTtsEngine
    } = useSettings();
    
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // If the disabled AI engine is somehow selected from old settings,
    // force it back to the browser engine and reset the voice if it was a premium one.
    useEffect(() => {
        if (ttsEngine === 'ai') {
            setTtsEngine('browser');
            const isPremium = premiumVoices.some(v => v.id === speechVoice);
            if (isPremium) {
                setSpeechVoice(null); // Reset to browser default
            }
        }
    }, [ttsEngine, setTtsEngine, speechVoice, setSpeechVoice]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            const englishVoices = availableVoices
                .filter(voice => voice.lang.startsWith('en'))
                .sort((a, b) => a.name.localeCompare(b.name));
            setVoices(englishVoices);
        };

        loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
            stopAllAudio();
        };
    }, []);

    const stopAllAudio = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
    };

    const playPreview = useCallback(async (
        voice: string | null,
        rate: number,
        pitch: number
    ) => {
        stopAllAudio();

        const premiumVoice = premiumVoices.find(v => v.id === voice);

        if (premiumVoice) {
            setIsGeneratingPreview(premiumVoice.id);
            try {
                // FIX: generateSpeech returns a Blob. Create an object URL from it for the Audio element.
                const audioBlob = await generateSpeech("Hello, this is how I will read your stories.", premiumVoice.id);
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audioRef.current = audio;
                await audio.play();
                audio.onended = () => {
                     // FIX: Revoke the object URL to prevent memory leaks after playback.
                     URL.revokeObjectURL(audioUrl);
                };
            } catch (error) {
                alert("Failed to generate premium AI speech. The AI might be busy or there was a network issue. Please try again.");
            } finally {
                setIsGeneratingPreview(null);
            }
        } else {
             if (!('speechSynthesis' in window)) return;
            const sampleUtterance = new SpeechSynthesisUtterance("Hello, this is how I will read your stories.");
            const selectedVoiceObject = voices.find(v => v.name === voice);

            if (selectedVoiceObject) {
                sampleUtterance.voice = selectedVoiceObject;
            }
            sampleUtterance.rate = rate;
            sampleUtterance.pitch = pitch;
            window.speechSynthesis.speak(sampleUtterance);
        }
    }, [voices]);
    
    useEffect(() => {
        return () => {
            stopAllAudio();
        };
    }, []);

    const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newVoiceName = e.target.value;
        setSpeechVoice(newVoiceName);
        playPreview(newVoiceName, speechRate, speechPitch);
    };

    const handlePremiumVoiceSelect = (voiceId: string) => {
        if (speechVoice === voiceId) {
             playPreview(voiceId, speechRate, speechPitch);
             return;
        }
        setSpeechVoice(voiceId);
        playPreview(voiceId, speechRate, speechPitch);
    };

    const handleSliderRelease = () => {
        playPreview(speechVoice, speechRate, speechPitch);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <Card>
                <h3 className="text-xl font-bold mb-2">Voice Engine</h3>
                <p className="text-[--text-secondary] mb-4">
                    Choose between high-quality AI voices or your browser's standard voices.
                </p>
                <div className="flex gap-2 bg-[--input-background] p-1 rounded-lg">
                    <button
                        disabled
                        className="w-1/2 p-2 rounded-md font-semibold transition-colors text-sm text-[--text-secondary] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Premium AI <span className="text-xs font-normal">(Coming Soon)</span>
                    </button>
                    <button
                        className="w-1/2 p-2 rounded-md font-semibold transition-colors text-sm bg-[--primary] text-[--primary-text] shadow"
                    >
                        Browser
                    </button>
                </div>
            </Card>

            <div className={`transition-opacity duration-300 ${ttsEngine !== 'ai' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <Card>
                    <h3 className="text-xl font-bold mb-2">Premium AI Voices</h3>
                    <p className="text-[--text-secondary] mb-4">
                        Powered by advanced AI for incredibly lifelike and expressive narration.
                    </p>
                    <div className="space-y-3">
                        {premiumVoices.map(voice => (
                            <button 
                                key={voice.id} 
                                onClick={() => handlePremiumVoiceSelect(voice.id)}
                                className={`w-full text-left flex items-center justify-between p-3 bg-[--input-background] rounded-lg transition-all border-2 ${speechVoice === voice.id ? 'border-[--primary]' : 'border-transparent hover:border-[--primary]/50'}`}
                                disabled={isGeneratingPreview !== null}
                            >
                                <span className="font-medium text-[--text-primary]">
                                    {voice.name}
                                    <span className="text-[--text-secondary] ml-2 font-normal text-sm">({voice.description})</span>
                                </span>
                                {isGeneratingPreview === voice.id && (
                                    <svg className="animate-spin h-5 w-5 text-[--primary]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>

             <div className={`transition-opacity duration-300 ${ttsEngine !== 'browser' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <Card>
                    <h3 className="text-xl font-bold mb-4">Browser Voice Engine</h3>
                    <p className="text-sm text-[--text-secondary] mb-4">
                        These standard voices are provided by your browser or operating system. Quality may vary.
                    </p>
                    <div className={`space-y-6`}>
                        <Select
                            id="speech-voice"
                            label="Voice"
                            value={premiumVoices.some(v => v.id === speechVoice) ? '' : speechVoice || ''}
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
                                onMouseUp={handleSliderRelease}
                                onTouchEnd={handleSliderRelease}
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
                                onMouseUp={handleSliderRelease}
                                onTouchEnd={handleSliderRelease}
                                className="w-full h-2 bg-[--input-background] rounded-lg appearance-none cursor-pointer accent-[--primary]"
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
