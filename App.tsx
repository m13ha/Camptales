import React, { useState, useEffect } from 'react';
import type { SavedStory, Character, GeneratedStory, HistoryItem } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { Layout } from './components/layout/Layout';
import { CreatorView } from './views/CreatorView';
import { SavedStoriesView } from './views/SavedStoriesView';
import { MyCharactersView } from './views/MyCharactersView';
import { SettingsView } from './views/SettingsView';
import { StoryReaderView } from './views/StoryReaderView';
import { HistoryView } from './views/HistoryView';
import { useSettings } from './contexts/SettingsContext';

type View = 'create' | 'stories' | 'characters' | 'settings' | 'reader' | 'history';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('create');
  const [previousView, setPreviousView] = useState<View>('create');
  const [savedStories, setSavedStories] = useLocalStorage<SavedStory[]>('bedtime-stories', []);
  const [savedCharacters, setSavedCharacters] = useLocalStorage<Character[]>('bedtime-characters', []);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('bedtime-history', []);
  const [storyForReader, setStoryForReader] = useState<GeneratedStory | SavedStory | HistoryItem | null>(null);
  const { historyRetention } = useSettings();

  // Effect to clean up old history items
  useEffect(() => {
    if (historyRetention === 'never') return;

    const now = new Date().getTime();
    const retentionDays = {
      '3d': 3,
      '7d': 7,
      '30d': 30,
    }[historyRetention];

    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

    const filteredHistory = history.filter(item => {
      const readAt = new Date(item.readAt).getTime();
      return now - readAt < retentionMs;
    });

    if (filteredHistory.length < history.length) {
      setHistory(filteredHistory);
    }
  }, [historyRetention, history, setHistory]);


  const handleSaveStory = (storyToSave: GeneratedStory) => {
    // 1. Remove from history if it exists
    setHistory(prev => prev.filter(h => h.title !== storyToSave.title || h.prompt.plot !== storyToSave.prompt.plot));

    // 2. Save story
    const newStory: SavedStory = {
      ...storyToSave,
      id: `story-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSavedStories(prev => [newStory, ...prev]);

    // 3. Save character
    const characterDescription = storyToSave.prompt.character;
    
    const nameMatch = characterDescription.match(/named\s+([A-Z]\w+)/i);
    const characterName = nameMatch ? nameMatch[1] : characterDescription.split(' ').slice(0, 3).join(' ');

    const characterExists = savedCharacters.some(c => c.name.toLowerCase() === characterName.toLowerCase() || c.description === characterDescription);

    if (!characterExists) {
        const newCharacter: Omit<Character, 'id'> = {
            name: characterName,
            description: characterDescription,
            imageUrl: storyToSave.parts[0]?.imageUrl
        };
        handleAddCharacter(newCharacter);
    }
  };

  const handleSaveFromHistory = (storyToSave: HistoryItem) => {
    handleSaveStory(storyToSave); // This will also remove it from history
    alert('Story saved to your library!');
  };

  const handleImportStory = (storyData: Omit<SavedStory, 'id' | 'createdAt'>) => {
    const isDuplicate = savedStories.some(s => s.title === storyData.title && s.prompt.plot === storyData.prompt.plot);
    if (isDuplicate) {
        alert("This story is already in your library!");
        return;
    }

    const newStory: SavedStory = {
        ...storyData,
        id: `story-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    setSavedStories(prev => [newStory, ...prev]);
    alert("Story imported successfully!");
  };


  const handleDeleteStory = (storyId: string) => {
    setSavedStories(prev => prev.filter(s => s.id !== storyId));
  };

  const handleReadStory = (story: GeneratedStory | SavedStory | HistoryItem) => {
    setStoryForReader(story);
    
    // Add to history if it's a new story and not already there
    const isSaved = 'createdAt' in story;
    if (!isSaved) {
        const isAlreadyInHistory = history.some(h => h.title === story.title && h.prompt.plot === story.prompt.plot);
        if (!isAlreadyInHistory) {
            const historyItem: HistoryItem = {
                ...story,
                id: `history-${Date.now()}`,
                readAt: new Date().toISOString(),
            };
            setHistory(prev => [historyItem, ...prev]);
        }
    }
    
    if (currentView !== 'reader') {
        setPreviousView(currentView);
    }
    setCurrentView('reader');
  };

  const handleBackFromReader = () => {
      setStoryForReader(null);
      setCurrentView(previousView);
  }

  const handleAddCharacter = (character: Omit<Character, 'id'>) => {
    const newCharacter: Character = {
      ...character,
      id: `char-${Date.now()}`,
    };
    setSavedCharacters(prev => [newCharacter, ...prev]);
  };

  const handleDeleteCharacter = (characterId: string) => {
    setSavedCharacters(prev => prev.filter(c => c.id !== characterId));
  };
  
  const handleSetView = (view: View) => {
    setCurrentView(view);
  }

  const isStoryForReaderSaved = storyForReader ? savedStories.some(s => {
    if ('id' in storyForReader && 'createdAt' in storyForReader) {
        return s.id === storyForReader.id;
    }
    return s.title === storyForReader.title && s.prompt.plot === storyForReader.prompt.plot;
  }) : false;

  return (
    <Layout currentView={currentView} setCurrentView={handleSetView}>
        {currentView === 'create' && (
          <CreatorView 
            characters={savedCharacters} 
            onStoryGenerated={handleReadStory}
          />
        )}
        {currentView === 'stories' && (
          <SavedStoriesView 
            stories={savedStories}
            onView={handleReadStory}
            onDelete={handleDeleteStory}
            onImport={handleImportStory}
          />
        )}
        {currentView === 'history' && (
          <HistoryView 
            historyItems={history}
            onView={handleReadStory}
            onSave={handleSaveFromHistory}
          />
        )}
        {currentView === 'characters' && (
          <MyCharactersView 
            characters={savedCharacters}
            onAdd={handleAddCharacter}
            onDelete={handleDeleteCharacter}
          />
        )}
        {currentView === 'settings' && (
          <SettingsView />
        )}
        {currentView === 'reader' && storyForReader && (
            <StoryReaderView
                story={storyForReader}
                onBack={handleBackFromReader}
                onSave={('createdAt' in storyForReader) ? undefined : () => handleSaveStory(storyForReader)}
                isSaved={isStoryForReaderSaved}
            />
        )}
    </Layout>
  );
};

export default App;