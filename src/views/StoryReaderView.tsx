import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF } from 'jspdf';
import type { GeneratedStory, SavedStory, HistoryItem, StoryAudio } from '../types';
import { StoryDisplay } from '../components/StoryDisplay';
import { Button } from '../components/ui/Button';
import { Save, ArrowLeft, Share2, Volume2, VolumeX, Menu, Play, Pause, StopCircle } from 'lucide-react';
import { ExportModal } from '../components/ExportModal';
import { useSettings } from '../contexts/SettingsContext';
import { themes } from '../themes';
import { generateSpeech } from '../services/ttsService';
import { premiumVoices } from '../voices';

interface StoryReaderViewProps {
  story: GeneratedStory | SavedStory | HistoryItem;
  onBack: () => void;
  onSave?: (story: GeneratedStory | SavedStory | HistoryItem, audio?: StoryAudio) => void;
  onUpdateStory?: (updatedStory: SavedStory) => void;
  isSaved: boolean;
  onError: (message: string) => void;
}

type PlaybackState = 'stopped' | 'playing' | 'paused' | 'buffering';

export const StoryReaderView: React.FC<StoryReaderViewProps> = ({ story, onBack, onSave, onUpdateStory, isSaved, onError }) => {
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('stopped');
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState(-1);
  const [isExporting, setIsExporting] = useState(false);
  
  const { 
    speechRate, setSpeechRate, 
    speechPitch, setSpeechPitch, 
    speechVoice, theme, ttsEngine 
  } = useSettings();

  const menuRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrl = useRef<string | null>(null);
  const isMountedRef = useRef(false);
  const isStoppedRef = useRef(true);
  const isIntentionalCancellationRef = useRef(false);

  const handleStop = useCallback(() => {
    isStoppedRef.current = true;
  
    // --- Start of robust cleanup logic ---
  
    // 1. Stop any browser-native speech synthesis first.
    window.speechSynthesis.cancel();
    
    // 2. Stop and clean up the HTMLAudioElement used for AI TTS.
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset position
    }
  
    // 3. Revoke the object URL to free up memory immediately. This is crucial for AI TTS.
    if (currentAudioUrl.current) {
        URL.revokeObjectURL(currentAudioUrl.current);
        currentAudioUrl.current = null;
    }
  
    // 4. Fully reset the audio element to prevent any lingering state.
    if (audioRef.current) {
        audioRef.current.removeAttribute('src'); 
        audioRef.current.load();
    }
    // --- End of robust cleanup logic ---
  
    if (isMountedRef.current) {
      setPlaybackState('stopped');
      setCurrentSpeechIndex(-1);
    }
  }, []);

  // Effect to manage the lifecycle of the component and audio player
  useEffect(() => {
    isMountedRef.current = true;
    isStoppedRef.current = true; // Ensure it's stopped on mount
    audioRef.current = new Audio();
    const audioEl = audioRef.current;

    const handleAudioEnd = () => {
      if (isMountedRef.current) {
        setPlaybackState('stopped');
        setCurrentSpeechIndex(-1);
      }
    };

    audioEl.addEventListener('ended', handleAudioEnd);

    // Return a cleanup function to run on component unmount
    return () => {
      isMountedRef.current = false;
      handleStop(); // Centralize all cleanup logic
      
      if (audioEl) {
        audioEl.removeEventListener('ended', handleAudioEnd);
      }
    };
  }, [handleStop]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Effect to update AI TTS playback rate when the slider changes.
  useEffect(() => {
    if (audioRef.current && ttsEngine === 'ai') {
        audioRef.current.playbackRate = speechRate;
    }
  }, [speechRate, ttsEngine]);

  if (!story || !Array.isArray(story.parts)) {
    return (
      <div className="w-full text-center p-8 bg-[--card-background] rounded-lg">
        <h2 className="text-2xl font-bold text-[--danger]">Story Error</h2>
        <p className="mt-2 text-[--text-secondary]">
          There was a problem loading this story's content. It might be corrupted or in an outdated format.
        </p>
        <Button onClick={onBack} size="sm" className="mt-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const handleExportPdf = async () => { /* ... implementation unchanged ... */ };
  
  const speakPart = useCallback((index: number) => {
      const partsToRead = story.parts.filter(p => p.paragraph && p.paragraph.trim());

      if (isStoppedRef.current) {
          return;
      }
      if (index >= partsToRead.length) {
          if (isMountedRef.current) handleStop();
          return;
      }

      const part = partsToRead[index];
      const utterance = new SpeechSynthesisUtterance(part.paragraph);

      const voices = speechSynthesis.getVoices();
      const selectedVoiceObject = speechVoice ? voices.find(v => v.name === speechVoice) : null;

      if (selectedVoiceObject) utterance.voice = selectedVoiceObject;
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;

      const originalIndex = story.parts.findIndex(p => p === part);
      utterance.onstart = () => {
          if (isMountedRef.current) setCurrentSpeechIndex(originalIndex);
      };
      utterance.onend = () => {
          if (isStoppedRef.current) {
              return;
          }
          if (isIntentionalCancellationRef.current) {
              isIntentionalCancellationRef.current = false; // Reset the flag
              return;
          }
          speakPart(index + 1);
      };
      utterance.onerror = () => {
          if (isMountedRef.current) {
              onError("An error occurred during text-to-speech.");
              handleStop();
          }
      };

      speechSynthesis.speak(utterance);
  }, [story.parts, speechVoice, speechRate, speechPitch, handleStop, onError]);

  const handlePlayPause = useCallback(() => {
      if (playbackState === 'playing') {
          if (ttsEngine === 'ai') {
              audioRef.current?.pause();
          } else {
              isIntentionalCancellationRef.current = true;
              window.speechSynthesis.cancel();
          }
          setPlaybackState('paused');
      } else if (playbackState === 'paused') {
          if (ttsEngine === 'ai') {
              audioRef.current?.play();
          } else {
              if (currentSpeechIndex >= 0) {
                  speakPart(currentSpeechIndex);
              }
          }
          setPlaybackState('playing');
      }
  }, [playbackState, ttsEngine, currentSpeechIndex, speakPart]);
  
  useEffect(() => {
    const isPlayingBrowser = playbackState === 'playing' && ttsEngine === 'browser' && currentSpeechIndex >= 0;
    if (!isPlayingBrowser) return;

    isIntentionalCancellationRef.current = true;
    window.speechSynthesis.cancel();

    const timerId = setTimeout(() => {
        if (isMountedRef.current && !isStoppedRef.current) {
            speakPart(currentSpeechIndex);
        }
    }, 50);

    return () => clearTimeout(timerId);
}, [speechRate, speechPitch]);


  const handleReadAloudClick = useCallback(async () => {
    if (playbackState !== 'stopped') {
        handleStop();
        return;
    }

    isStoppedRef.current = false; // Reset the stop flag before starting.

    const partsToRead = story.parts.filter(p => p.paragraph && p.paragraph.trim());
    if (partsToRead.length === 0) {
      onError("This story has no text content to read aloud.");
      return;
    }

    if (ttsEngine === 'ai') {
        const isPremiumVoiceSelected = premiumVoices.some(v => v.id === speechVoice);
        if (!speechVoice || !isPremiumVoiceSelected) {
            onError("Please select a Premium AI voice in Settings to use this feature.");
            return;
        }

        setPlaybackState('buffering');

        try {
            let audioBlob: Blob | null = null;
            if ('audio' in story && story.audio && story.audio.voiceId === speechVoice) {
                audioBlob = story.audio.data;
            } else {
                const fullText = story.parts.map(p => p.paragraph).join('\n\n');
                audioBlob = await generateSpeech(fullText, speechVoice);
                
                if (!isMountedRef.current || isStoppedRef.current) {
                  handleStop();
                  return;
                }

                const audioData: StoryAudio = { voiceId: speechVoice, data: audioBlob };
                if (isSaved && 'id' in story && onUpdateStory) onUpdateStory({ ...(story as SavedStory), audio: audioData });
                else if (!isSaved && onSave) onSave(story, audioData);
            }

            if (audioBlob) {
                if (currentAudioUrl.current) {
                  URL.revokeObjectURL(currentAudioUrl.current);
                }
                const newUrl = URL.createObjectURL(audioBlob);
                currentAudioUrl.current = newUrl;
                
                if (audioRef.current) {
                    audioRef.current.src = newUrl;
                    audioRef.current.playbackRate = speechRate;
                    await audioRef.current.play();

                    if (!isMountedRef.current || isStoppedRef.current) {
                      handleStop();
                      return;
                    }

                    setPlaybackState('playing');
                }
            }
        } catch (err) {
            if (!isMountedRef.current) {
              return;
            }
            onError(err instanceof Error ? err.message : "An unknown error occurred during AI speech generation.");
            handleStop();
        }
    } else {
      if (!('speechSynthesis' in window)) {
        onError("Sorry, your browser doesn't support text-to-speech.");
        return;
      }
      setPlaybackState('playing');
      speakPart(0);
    }
  }, [story, speechRate, speechVoice, onError, handleStop, isSaved, onSave, onUpdateStory, ttsEngine, playbackState, speakPart, onUpdateStory]);

  const canBeExported = 'createdAt' in story;
  const isSpeaking = playbackState === 'playing';

  return (
    <div className="w-full">
      <header className="fixed top-0 left-0 right-0 h-16 bg-[--background] border-b border-[--border] z-40 flex items-center">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between h-full">
            <Button onClick={onBack} size="sm">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
            </Button>

            <div className="relative" ref={menuRef}>
            <Button
                onClick={() => setIsMenuOpen(prev => !prev)}
                size="sm"
                className="!p-2.5"
                aria-label="Story options"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
            >
                <Menu className="w-6 h-6" />
            </Button>
            {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[--card-background] border border-[--border] rounded-lg shadow-xl py-2 z-50 animate-fade-in">
                <ul className="text-[--text-primary]">
                    <li>
                    <button
                        onClick={() => { handleReadAloudClick(); setIsMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={playbackState === 'buffering'}
                    >
                        {playbackState === 'buffering' ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8
 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            playbackState !== 'stopped' ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />
                        )}
                        <span>{playbackState === 'buffering' ? 'Preparing...' : (playbackState !== 'stopped' ? 'Stop Reading' : 'Read Aloud')}</span>
                    </button>
                    </li>
                    {canBeExported && (
                    <li>
                        <button
                        onClick={() => { setExportModalOpen(true); setIsMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors"
                        >
                        <Share2 className="w-5 h-5" />
                        <span>Export...</span>
                        </button>
                    </li>
                    )}
                </ul>
                </div>
            )}
            </div>
        </div>
      </header>
      
      <div className="pt-16 pb-40"> {/* Add padding bottom for control bar */}
        <StoryDisplay story={story} isSpeaking={isSpeaking} currentSpeechIndex={currentSpeechIndex} />
        
        {onSave && (
          <div className="text-center mt-8">
              <Button onClick={() => onSave(story)} disabled={isSaved} size="lg">
                  <Save className="w-5 h-5 mr-2" />
                  {isSaved ? 'Story Saved!' : 'Save This Story'}
              </Button>
          </div>
        )}
      </div>

      {/* Audio Control Bar */}
      {playbackState !== 'stopped' && playbackState !== 'buffering' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in">
          <div className="bg-[--card-background]/80 backdrop-blur-sm border-t border-[--border] p-4 max-w-3xl mx-auto rounded-t-xl">
              <div className="flex items-center gap-4">
                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                      <Button onClick={handlePlayPause} className="!p-4" aria-label={playbackState === 'playing' ? 'Pause' : 'Play'}>
                          {playbackState === 'playing' ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </Button>
                      <Button onClick={handleStop} className="!p-4 !bg-gray-600 hover:!bg-gray-700" aria-label="Stop">
                          <StopCircle className="w-6 h-6"/>
                      </Button>
                  </div>

                  {/* Sliders */}
                  <div className="flex-grow space-y-3">
                      <div>
                          <label htmlFor="speech-rate" className="flex justify-between mb-1 text-xs font-medium text-[--text-secondary]">
                              <span>Speed</span>
                              <span>{speechRate.toFixed(1)}x</span>
                          </label>
                          <input
                              type="range"
                              id="speech-rate"
                              min="0.5" max="2" step="0.1"
                              value={speechRate}
                              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                              className="w-full h-2 bg-[--input-background] rounded-lg appearance-none cursor-pointer accent-[--primary]"
                          />
                      </div>
                      {ttsEngine === 'browser' && (
                           <div>
                              <label htmlFor="speech-pitch" className="flex justify-between mb-1 text-xs font-medium text-[--text-secondary]">
                                  <span>Pitch</span>
                                  <span>{speechPitch.toFixed(1)}</span>
                              </label>
                              <input
                                  type="range"
                                  id="speech-pitch"
                                  min="0" max="2" step="0.1"
                                  value={speechPitch}
                                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                                  className="w-full h-2 bg-[--input-background] rounded-lg appearance-none cursor-pointer accent-[--primary]"
                              />
                          </div>
                      )}
                  </div>
              </div>
          </div>
        </div>
      )}

      {canBeExported && (
         <ExportModal 
            isOpen={isExportModalOpen}
            onClose={() => setExportModalOpen(false)}
            stories={[story as SavedStory]}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExporting}
         />
      )}
    </div>
  );
};
