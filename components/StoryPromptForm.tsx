import React, { useState } from 'react';
import type { UserPrompt, Character } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface StoryPromptFormProps {
  onSubmit: () => void;
  isLoading: boolean;
  characters: Character[];
  prompt: UserPrompt;
  onPromptChange: (prompt: UserPrompt) => void;
}

export const StoryPromptForm: React.FC<StoryPromptFormProps> = ({ onSubmit, isLoading, characters, prompt, onPromptChange }) => {
  const [selectedCharId, setSelectedCharId] = useState<string>('');

  const handleCharacterSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const charId = e.target.value;
    setSelectedCharId(charId);
    const selected = characters.find(c => c.id === charId);
    if (selected) {
        onPromptChange({ ...prompt, character: selected.description });
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.character.trim() && prompt.setting.trim() && prompt.plot.trim() && prompt.concept.trim()) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="character-select" className="block mb-2 text-sm font-medium text-[--text-secondary]">
                    Use a Saved Character
                </label>
                <select 
                    id="character-select"
                    value={selectedCharId}
                    onChange={handleCharacterSelection}
                    disabled={isLoading}
                    className="w-[90%] px-4 py-2.5 bg-[--input-background] border-2 border-[--border] rounded-lg text-[--text-primary] transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[--primary] focus:border-[--primary] disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                    <option value="">-- Write a new character --</option>
                    {characters.map(char => (
                        <option key={char.id} value={char.id}>{char.name}</option>
                    ))}
                </select>
            </div>
            <Input
                id="setting"
                label="Setting"
                value={prompt.setting}
                onChange={(e) => onPromptChange({ ...prompt, setting: e.target.value })}
                placeholder="e.g., A sparkling crystal cave"
                required
                disabled={isLoading}
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
        disabled={isLoading}
        rows={3}
      />
      <Textarea
        id="plot"
        label="Plot / Idea"
        value={prompt.plot}
        onChange={(e) => onPromptChange({ ...prompt, plot: e.target.value })}
        placeholder="e.g., Looking for the legendary Whispering Flower"
        required
        disabled={isLoading}
        rows={3}
      />
       <Textarea
        id="concept"
        label="Concept to Convey (Optional)"
        value={prompt.concept}
        onChange={(e) => onPromptChange({ ...prompt, concept: e.target.value })}
        placeholder="e.g., The importance of sharing"
        required
        disabled={isLoading}
        rows={2}
      />
      <div className="text-center pt-2">
        <Button type="submit" disabled={isLoading} size="lg">
          <MagicWandIcon className="w-5 h-5 mr-2" />
          {isLoading ? 'Creating Magic...' : 'Generate Story'}
        </Button>
      </div>
    </form>
  );
};