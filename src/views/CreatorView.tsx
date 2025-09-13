import React, { useState, useCallback } from 'react';
import { StoryPromptForm } from '../components/StoryPromptForm';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { generateStoryAndImages, generateStoryIdeas, generateTitle } from '../services/geminiService';
import type { GeneratedStory, UserPrompt, Character } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { storyLayouts } from '../layouts';

interface CreatorViewProps {
    characters: Character[];
    onStoryGenerated: (story: GeneratedStory) => void;
    onError: (message: string) => void;
}

export const CreatorView: React.FC<CreatorViewProps> = ({ characters, onStoryGenerated, onError }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const { storyLayout } = useSettings();
    
    const [prompt, setPrompt] = useState<UserPrompt>({
        character: 'A brave little firefly named Flicker',
        setting: 'A magical, moonlit forest',
        plot: 'Who is trying to find the lost North Star to guide it home',
        concept: 'The importance of perseverance and asking for help'
    });
    const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
    const [category, setCategory] = useState<string>('Surprise Me!');

    const handleGenerateIdeas = useCallback(async () => {
        setIsLoadingIdeas(true);
        try {
            const ideas = await generateStoryIdeas(category);
            setPrompt(ideas);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'An unknown error occurred while brainstorming.');
        } finally {
            setIsLoadingIdeas(false);
        }
    }, [category, onError]);


    const handleGenerateStory = useCallback(async () => {
        setIsLoading(true);
        
        try {
            setLoadingMessage('Dreaming up a title...');
            const title = await generateTitle(prompt);

            setLoadingMessage('Crafting a wondrous tale just for you...');
            const aspectRatio = storyLayouts[storyLayout].aspectRatio;
            const parts = await generateStoryAndImages(prompt, setLoadingMessage, aspectRatio);
            
            onStoryGenerated({ title, parts, prompt, layout: storyLayout });
        } catch (err) {
            console.error(err);
            onError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [prompt, onStoryGenerated, storyLayout, onError]);

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
                />
            )}
            
            {isLoading && <LoadingIndicator message={loadingMessage} />}
        </div>
    );
};
