import React, { useState, useRef } from 'react';
import type { Character } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Users, Mic } from 'lucide-react';
import { generateCharacterImage, transcribeAndStructureCharacterPrompt } from '../services/geminiService';
import { VoiceInputModal } from './VoiceInputModal';
import { useApiRateLimiter } from '../hooks/useApiRateLimiter';

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (character: Omit<Character, 'id' | 'createdAt'>) => void;
  onError: (message: string) => void;
}

export const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({ isOpen, onClose, onAdd, onError }) => {
  const [newChar, setNewChar] = useState({
    name: '',
    description: '',
    imageUrl: null as string | null,
  });
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { getRemaining, recordAction, isBlocked, isLoading: isRateLimiterLoading } = useApiRateLimiter();
  const portraitsRemaining = getRemaining('createCharacter');
  const portraitCreationBlocked = isBlocked('createCharacter');

  const isBusy = isGeneratingPreview || isRecording || isProcessingAudio || isRateLimiterLoading;
  const isGenerateDisabled = isBusy || portraitCreationBlocked;

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMediaStream(stream);

          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];

          recorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          recorder.onstop = async () => {
              const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
              const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
              
              stream.getTracks().forEach(track => track.stop());
              setMediaStream(null);
              
              setIsProcessingAudio(true);
              
              try {
                  const characterData = await transcribeAndStructureCharacterPrompt(audioBlob);
                  setNewChar(prev => ({ ...prev, ...characterData }));
              } catch (error) {
                  onError(error instanceof Error ? error.message : 'Failed to process your voice input. Please try again.');
              } finally {
                  setIsProcessingAudio(false);
              }
          };

          recorder.start();
          setIsRecording(true);
      } catch (err) {
          onError("Could not access the microphone. Please check your browser permissions.");
      }
  };

  const handleGeneratePreview = async () => {
    if (!newChar.description.trim() || isBusy) return;
    if (portraitCreationBlocked) {
        onError("You have reached your daily limit for character portrait generations. Please try again tomorrow.");
        return;
    }
    setIsGeneratingPreview(true);
    try {
      const imageUrl = await generateCharacterImage(newChar.description);
      setNewChar(prev => ({ ...prev, imageUrl }));
      recordAction('createCharacter');
    } catch (err) {
      console.error("Failed to generate preview image:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      onError(`Could not generate portrait: ${errorMessage}`);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleSaveCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChar.name.trim() || !newChar.description.trim() || !newChar.imageUrl) {
        onError("Please make sure you have a description, a generated portrait, and a name for your character.");
        return;
    };

    onAdd({
      name: newChar.name,
      description: newChar.description,
      imageUrl: newChar.imageUrl,
    });

    handleClose();
  };
  
  const handleClose = () => {
    setNewChar({ name: '', description: '', imageUrl: null });
    setIsGeneratingPreview(false);
    onClose();
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Create New Character" size="xl">
        <form onSubmit={handleSaveCharacter}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column: Image Preview */}
            <div className="aspect-square bg-[--input-background] border-2 border-dashed border-[--border] rounded-lg flex items-center justify-center overflow-hidden relative">
                {isGeneratingPreview && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                {newChar.imageUrl ? (
                    <img src={newChar.imageUrl} alt="Character preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center text-[--text-secondary] p-4">
                        <Users className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm font-semibold">Your character portrait will appear here</p>
                    </div>
                )}
            </div>

            {/* Right Column: Form Fields */}
            <div className="flex flex-col space-y-4">
                <Textarea
                    id="char-desc"
                    label="1. Describe your character"
                    value={newChar.description}
                    onChange={(e) => setNewChar(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., A tiny dragon the size of a teacup..."
                    required
                    disabled={isBusy}
                    rows={4}
                    className="flex-grow"
                />
                
                <div className="flex flex-col items-stretch">
                  <div className="flex items-center gap-2 w-full">
                    <Button 
                        type="button" 
                        onClick={handleGeneratePreview}
                        disabled={isGenerateDisabled || !newChar.description.trim()}
                        className="w-full"
                    >
                        {isGeneratingPreview ? 'Generating...' : (isRateLimiterLoading ? 'Checking...' : (portraitCreationBlocked ? 'Limit Reached' : '2. Generate Portrait'))}
                    </Button>
                    <Button
                        type="button"
                        onClick={startRecording}
                        disabled={isBusy}
                        className="flex-shrink-0 !p-3"
                        aria-label="Start recording character description"
                        title="Start recording character description"
                    >
                        {isProcessingAudio ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <Mic className="w-5 h-5" />
                        )}
                    </Button>
                  </div>
                  <p className="text-xs text-center text-[--text-secondary] mt-2">
                    {isRateLimiterLoading ? 'Checking daily limit...' : `You have ${portraitsRemaining} portrait ${portraitsRemaining === 1 ? 'generation' : 'generations'} left today.`}
                  </p>
                </div>

                 <Input
                    id="char-name"
                    label="3. Name your character"
                    value={newChar.name}
                    onChange={(e) => setNewChar(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sparklewing"
                    required
                    disabled={isBusy || !newChar.imageUrl}
                />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[--border]">
              <Button 
                  type="button" 
                  onClick={handleClose} 
                  className="!bg-gray-600 hover:!bg-gray-700"
                  disabled={isBusy}
              >
                  Cancel
              </Button>
              <Button 
                  type="submit" 
                  disabled={isBusy || !newChar.name.trim() || !newChar.imageUrl} 
              >
                  Save Character
              </Button>
          </div>
        </form>
      </Modal>
      <VoiceInputModal 
        isOpen={isRecording}
        onStop={stopRecording}
        stream={mediaStream}
      />
    </>
  );
};