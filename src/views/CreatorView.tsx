import React, { useState, useCallback } from 'react';
import { StoryPromptForm } from '../components/StoryPromptForm';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { generateStoryAndImages, generateStoryIdeas, generateTitle } from '../services/geminiService';
import type { GeneratedStory, UserPrompt, Character } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { storyLayouts } from '../layouts';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useApiRateLimiter } from '../hooks/useApiRateLimiter';

interface CreatorViewProps {
    characters: Character[];
    onStoryGenerated: (story: GeneratedStory) => void;
    onError: (message: string) => void;
}

export const CreatorView: React.FC<CreatorViewProps> = ({ characters, onStoryGenerated, onError }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const { storyLayout } = useSettings();
    const { getRemaining, recordAction, isBlocked, isLoading: isRateLimiterLoading } = useApiRateLimiter();
    
    const [prompt, setPrompt] = useLocalStorage<UserPrompt>('story-prompt-draft', {
        character: 'A brave little firefly named Flicker',
        setting: 'A magical, moonlit forest',
        plot: 'Who is trying to find the lost North Star to guide it home',
        concept: 'The importance of perseverance and asking for help'
    });
    const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
    const [category, setCategory] = useLocalStorage<string>('story-category-draft', 'Surprise Me!');

    const handleGenerateIdeas = useCallback(async () => {
        setIsLoadingIdeas(true);
        try {
            const ideas = await generateStoryIdeas(category);
            setPrompt(ideas);
            setSelectedCharacter(null); // Clear selected character when generating new ideas
        } catch (err) {
            onError(err instanceof Error ? err.message : 'An unknown error occurred while brainstorming.');
        } finally {
            setIsLoadingIdeas(false);
        }
    }, [category, onError, setPrompt]);


    const handleGenerateStory = useCallback(async () => {
        if (isBlocked('createStory')) {
            onError("You have reached your daily limit for story generations. Please try again tomorrow.");
            return;
        }
        setIsLoading(true);
        
        try {
            setLoadingMessage('Dreaming up a title...');
            const title = await generateTitle(prompt);
            
            const aspectRatio = storyLayouts[storyLayout].aspectRatio;
            const parts = await generateStoryAndImages(prompt, setLoadingMessage, aspectRatio, selectedCharacter?.imageUrl);
            
            onStoryGenerated({ title, parts, prompt, layout: storyLayout });
            recordAction('createStory');
        } catch (err) {
            onError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [prompt, onStoryGenerated, storyLayout, onError, selectedCharacter, isBlocked, recordAction]);

    const storiesRemaining = getRemaining('createStory');
    const storyCreationBlocked = isBlocked('createStory');

    return (
         <div className="w-full max-w-3xl mx-auto">
            {!isLoading && (
                <StoryPromptForm 
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    onSubmit={handleGenerateStory} 
                    isLoading={isLoading || isLoadingIdeas}
                    characters={characters}
                    onGenerateIdeas={handleGenerateIdeas}
                    isGeneratingIdeas={isLoadingIdeas}
                    category={category}
                    onCategoryChange={setCategory}
                    onError={onError}
                    onCharacterSelect={setSelectedCharacter}
                    storiesRemaining={storiesRemaining}
                    storyCreationBlocked={storyCreationBlocked}
                    isCheckingLimits={isRateLimiterLoading}
                />
            )}
            
            {isLoading && <LoadingIndicator message={loadingMessage} />}
        </div>
    );
};
