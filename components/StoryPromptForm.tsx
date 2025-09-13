import React, { useState, useRef } from 'react';
import type { UserPrompt, Character } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { transcribeAndStructureStoryPrompt } from '../services/geminiService';

interface StoryPromptFormProps {
  onSubmit: () => void;
  isLoading: boolean;
  characters: Character[];
  prompt: UserPrompt;
  onPromptChange: (prompt: UserPrompt) => void;
  onGenerateIdeas: () => void;
  isGeneratingIdeas: boolean;
  category: string;
  onCategoryChange: (string) => void;
}

const storyCategories = [
  'Surprise Me!',
  'Morality (Honesty, Fairness)',
  'Society (Community, Friendship)',
  'Caution & Safety',
  'Trust & Relationships',
  'Economics (Sharing, Saving)',
  'Creativity & Imagination',
  'Science & Nature',
  'Understanding Emotions',
  'Courage & Adventure',
];

export const StoryPromptForm: React.FC<StoryPromptFormProps> = ({ 
    onSubmit, 
    isLoading, 
    characters, 
    prompt, 
    onPromptChange,
    onGenerateIdeas,
    isGeneratingIdeas,
    category,
    onCategoryChange
 }) => {
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
              
              setIsRecording(false);
              setIsProcessingAudio(true);
              
              try {
                  const structuredPrompt = await transcribeAndStructureStoryPrompt(audioBlob);
                  onPromptChange(structuredPrompt);
              } catch (error) {
                  console.error("Error processing audio:", error);
                  alert(error instanceof Error ? error.message : 'Failed to process your voice input. Please try again.');
              } finally {
                  setIsProcessingAudio(false);
              }
          };

          recorder.start();
          setIsRecording(true);
      } catch (err) {
          console.error("Error getting microphone access:", err);
          alert("Could not access the microphone. Please check your browser permissions.");
      }
  };

  const handleMicClick = () => {
      if (isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  };

  const isBusy = isLoading || isGeneratingIdeas || isRecording || isProcessingAudio;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.character.trim() && prompt.setting.trim() && prompt.plot.trim() && prompt.concept.trim()) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <div>
            {/* Section 1: Story Details */}
            <div>
                <h3 className="text-sm font-semibold text-[--text-secondary] uppercase tracking-wider mb-4">Story Details</h3>
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Select
                            id="character-select"
                            label="Use a Saved Character"
                            value={selectedCharId}
                            onChange={(e) => {
                            const charId = e.target.value;
                            setSelectedCharId(charId);
                            const selected = characters.find(c => c.id === charId);
                            if (selected) {
                                onPromptChange({ ...prompt, character: selected.description });
                            }
                            }}
                            disabled={isBusy}
                        >
                            <option value="">-- Write a new character --</option>
                            {characters.map(char => (
                                <option key={char.id} value={char.id}>{char.name}</option>
                            ))}
                        </Select>
                        <Input
                            id="setting"
                            label="Setting"
                            value={prompt.setting}
                            onChange={(e) => onPromptChange({ ...prompt, setting: e.target.value })}
                            placeholder="e.g., A sparkling crystal cave"
                            required
                            disabled={isBusy}
                        />
                    </div>
                    <Textarea
                        id="character-description"
                        label="Main Character Description"
                        value={prompt.character}
                        onChange={(e) => {
                            onPromptChange({ ...prompt, character: e.target.value });
                            setSelectedCharId(''); // Deselect if user types manually
                        }}
                        placeholder="e.g., A curious rabbit with a tiny backpack"
                        required
                        disabled={isBusy}
                        rows={3}
                    />
                    <Textarea
                        id="plot"
                        label="Plot / Idea"
                        value={prompt.plot}
                        onChange={(e) => onPromptChange({ ...prompt, plot: e.target.value })}
                        placeholder="e.g., Looking for the legendary Whispering Flower"
                        required
                        disabled={isBusy}
                        rows={3}
                    />
                    <Textarea
                        id="concept"
                        label="Concept to Convey (Optional)"
                        value={prompt.concept}
                        onChange={(e) => onPromptChange({ ...prompt, concept: e.target.value })}
                        placeholder="e.g., The importance of sharing"
                        required
                        disabled={isBusy}
                        rows={2}
                    />
                    <Select
                        id="category-select"
                        label="Inspiration Theme"
                        value={category}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        disabled={isBusy}
                        className="w-full"
                    >
                        {storyCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 mt-8 border-t border-[--border]">
                <div className="flex justify-center items-center gap-4">
                    <Button
                        type="button"
                        onClick={onGenerateIdeas}
                        disabled={isBusy}
                        className="flex-shrink-0 !p-3"
                        aria-label="Generate new story idea"
                        title="Generate new story idea"
                    >
                        {isGeneratingIdeas ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <RefreshCwIcon className="w-5 h-5" />
                        )}
                    </Button>
                    <Button type="submit" disabled={isBusy} size="lg">
                        <MagicWandIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleMicClick}
                        disabled={isLoading || isGeneratingIdeas || isProcessingAudio}
                        className={`flex-shrink-0 !p-3 ${isRecording ? '!bg-red-600 hover:!bg-red-700 focus:!ring-red-500' : ''}`}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording story idea'}
                        title={isRecording ? 'Stop recording' : 'Start recording story idea'}
                    >
                        {isProcessingAudio ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <MicrophoneIcon className="w-5 h-5" />
                        )}
                    </Button>

                </div>
            </div>
        </div>
      </Card>
    </form>
  );
};