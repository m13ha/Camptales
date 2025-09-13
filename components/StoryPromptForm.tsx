import React, { useState } from 'react';
import type { UserPrompt, Character } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';
import { Card } from './ui/Card';

interface StoryPromptFormProps {
  onSubmit: () => void;
  isLoading: boolean;
  characters: Character[];
  prompt: UserPrompt;
  onPromptChange: (prompt: UserPrompt) => void;
  onGenerateIdeas: () => void;
  isGeneratingIdeas: boolean;
  category: string;
  onCategoryChange: (category: string) => void;
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
       <Card className="!p-4">
        <div className="space-y-3">
          <label htmlFor="category-select" className="block text-sm font-medium text-[--text-secondary]">
            Need inspiration? Pick a theme and get a new idea!
          </label>
          <div className="flex items-center gap-2">
            <select
              id="category-select"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              disabled={isLoading}
              className="flex-grow px-4 py-2.5 bg-[--input-background] border-2 border-[--border] rounded-lg text-[--text-primary] transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[--primary] focus:border-[--primary] disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              {storyCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button
              type="button"
              onClick={onGenerateIdeas}
              disabled={isLoading}
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
          </div>
        </div>
      </Card>
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
          {isLoading ? 'Creating...' : 'Generate Story'}
        </Button>
      </div>
    </form>
  );
};