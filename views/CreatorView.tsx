import React, { useState, useCallback, useEffect } from 'react';
import { StoryPromptForm } from '../components/StoryPromptForm';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { generateStoryAndImages, generateStoryIdeas } from '../services/geminiService';
import type { GeneratedStory, UserPrompt, Character } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { storyLayouts } from '../layouts';

interface CreatorViewProps {
    characters: Character[];
    onStoryGenerated: (story: GeneratedStory) => void;
}

export const CreatorView: React.FC<CreatorViewProps> = ({ characters, onStoryGenerated }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const { storyLayout } = useSettings();
    
    const [prompt, setPrompt] = useState<UserPrompt>({
        character: 'A brave little firefly named Flicker',
        setting: 'A magical, moonlit forest',
        plot: 'Who is trying to find the lost North Star to guide it home',
        concept: 'The importance of perseverance and asking for help'
    });
    const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);

    useEffect(() => {
        const hasGenerated = sessionStorage.getItem('ideas_generated');
        if (!hasGenerated) {
            setIsLoadingIdeas(true);
            generateStoryIdeas()
                .then(ideas => {
                    setPrompt(ideas);
                    sessionStorage.setItem('ideas_generated', 'true');
                })
                .catch(err => {
                    console.error("Failed to generate story ideas", err);
                    // Keep default prompt on error
                })
                .finally(() => {
                    setIsLoadingIdeas(false);
                });
        }
    }, []);

    const handleGenerateStory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setLoadingMessage('Once upon a time, our AI storyteller is waking up...');

        try {
            const aspectRatio = storyLayouts[storyLayout].aspectRatio;
            const { title, parts } = await generateStoryAndImages(prompt, setLoadingMessage, aspectRatio);
            onStoryGenerated({ title, parts, prompt, layout: storyLayout });
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [prompt, onStoryGenerated, storyLayout]);

    return (
         <div className="w-full max-w-xl mx-auto">
            {!isLoading && (
                <StoryPromptForm 
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    onSubmit={handleGenerateStory} 
                    isLoading={isLoading || isLoadingIdeas} 
                    characters={characters} 
                />
            )}
            
            {isLoading && <LoadingIndicator message={loadingMessage} />}
            
            {error && (
                <div className="mt-8 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
                <h3 className="font-bold mb-2">An error occurred</h3>
                <p>{error}</p>
                </div>
            )}
        </div>
    );
};
