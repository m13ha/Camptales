import React, { useState, useEffect, useCallback } from 'react';
import type { GeneratedStory, SavedStory, HistoryItem } from '../types';
import { StoryDisplay } from '../components/StoryDisplay';
import { Button } from '../components/ui/Button';
import { SaveIcon } from '../components/icons/SaveIcon';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import { ShareIcon } from '../components/icons/ShareIcon';
import { ShareModal } from '../components/ShareModal';
import { SpeakerOnIcon } from '../components/icons/SpeakerOnIcon';
import { SpeakerOffIcon } from '../components/icons/SpeakerOffIcon';
import { useSettings } from '../contexts/SettingsContext';

interface StoryReaderViewProps {
  story: GeneratedStory | SavedStory | HistoryItem;
  onBack: () => void;
  onSave?: (story: GeneratedStory | SavedStory | HistoryItem) => void;
  isSaved: boolean;
}

export const StoryReaderView: React.FC<StoryReaderViewProps> = ({ story, onBack, onSave, isSaved }) => {
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState(-1);
  const { speechRate, speechPitch } = useSettings();

  // Guard clause to prevent crashes from malformed story data (e.g., from old storage versions)
  if (!story || !Array.isArray(story.parts)) {
    return (
      <div className="w-full text-center p-8 bg-[--card-background] rounded-lg">
        <h2 className="text-2xl font-bold text-[--danger]">Story Error</h2>
        <p className="mt-2 text-[--text-secondary]">
          There was a problem loading this story's content. It might be corrupted or in an outdated format.
        </p>
        <Button onClick={onBack} size="sm" className="mt-6">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Stop speaking when the component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = useCallback(() => {
    if (!('speechSynthesis' in window)) {
        alert("Sorry, your browser doesn't support text-to-speech.");
        return;
    }

    if (isSpeaking) {
        speechSynthesis.cancel();
        // The onend event of the utterance will not fire when cancelled, so we manually reset state.
        setIsSpeaking(false);
        setCurrentSpeechIndex(-1);
    } else {
        setIsSpeaking(true);
        speechSynthesis.cancel(); // Clear any leftovers just in case

        const partsToRead = story.parts;
        partsToRead.forEach((part, index) => {
            const utterance = new SpeechSynthesisUtterance(part.paragraph);
            
            utterance.rate = speechRate;
            utterance.pitch = speechPitch;

            utterance.onstart = () => {
                setCurrentSpeechIndex(index);
            };

            if (index === partsToRead.length - 1) {
                utterance.onend = () => {
                    setIsSpeaking(false);
                    setCurrentSpeechIndex(-1);
                };
            }

            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
                setIsSpeaking(false);
                setCurrentSpeechIndex(-1);
                if (index === 0) {
                     alert("An error occurred during text-to-speech.");
                }
            };

            speechSynthesis.speak(utterance);
        });
    }
  }, [isSpeaking, story.parts, speechRate, speechPitch]);

  const canBeShared = 'createdAt' in story;

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <Button onClick={onBack} size="sm">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-2">
            <Button onClick={handleToggleSpeech} size="sm">
                {isSpeaking ? (
                    <>
                        <SpeakerOffIcon className="w-5 h-5 mr-2" />
                        Stop Reading
                    </>
                ) : (
                    <>
                        <SpeakerOnIcon className="w-5 h-5 mr-2" />
                        Read Aloud
                    </>
                )}
            </Button>
            {canBeShared && (
            <Button onClick={() => setShareModalOpen(true)} size="sm">
                <ShareIcon className="w-5 h-5 mr-2" />
                Share
            </Button>
            )}
        </div>
      </div>
      
      <StoryDisplay story={story} isSpeaking={isSpeaking} currentSpeechIndex={currentSpeechIndex} />
      
      {onSave && (
        <div className="text-center mt-8">
            <Button onClick={() => onSave(story)} disabled={isSaved} size="lg">
                <SaveIcon className="w-5 h-5 mr-2" />
                {isSaved ? 'Story Saved!' : 'Save This Story'}
            </Button>
        </div>
      )}

      {canBeShared && (
         <ShareModal 
            isOpen={isShareModalOpen}
            onClose={() => setShareModalOpen(false)}
            story={story as SavedStory}
         />
      )}
    </div>
  );
};
