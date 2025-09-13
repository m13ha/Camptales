import React, { useState, useEffect } from 'react';
import type { SavedStory, Character, GeneratedStory, HistoryItem } from './types';
import { useIndexedDB } from './hooks/useIndexedDB';
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
  
  const { data: savedStories, addItem: addStory, deleteItem: deleteStory } = useIndexedDB<SavedStory>('stories');
  const { data: savedCharacters, addItem: addCharacterDB, deleteItem: deleteCharacterDB } = useIndexedDB<Character>('characters');
  const { data: history, addItem: addHistoryItem, deleteItem: deleteHistoryItem, deleteMultipleItems: deleteHistoryItems } = useIndexedDB<HistoryItem>('history');
  
  const [storyForReader, setStoryForReader] = useState<GeneratedStory | SavedStory | HistoryItem | null>(null);
  const { historyRetention } = useSettings();

  // Effect to clean up old history items
  useEffect(() => {
    if (historyRetention === 'never' || !history || history.length === 0) return;

    const now = new Date().getTime();
    const retentionDays = {
      '3d': 3,
      '7d': 7,
      '30d': 30,
    }[historyRetention];

    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

    const itemsToDelete = history.filter(item => {
      const readAt = new Date(item.readAt).getTime();
      return now - readAt >= retentionMs;
    });

    if (itemsToDelete.length > 0) {
      const idsToDelete = itemsToDelete.map(item => item.id);
      deleteHistoryItems(idsToDelete);
    }
  }, [historyRetention, history, deleteHistoryItems]);


  const handleSaveStory = async (storyToSave: GeneratedStory | HistoryItem) => {
    // 1. Remove from history if it exists
    const historyItem = history.find(h => h.title === storyToSave.title && h.prompt.plot === storyToSave.prompt.plot);
    if (historyItem) {
        await deleteHistoryItem(historyItem.id);
    }

    // 2. Save story
    const newStory: SavedStory = {
      title: storyToSave.title,
      parts: storyToSave.parts,
      prompt: storyToSave.prompt,
      layout: storyToSave.layout,
      id: `story-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await addStory(newStory);

    // 3. Save character
    const characterDescription = storyToSave.prompt.character;
    
    const nameMatch = characterDescription.match(/named\s+([A-Z]\w+)/i);
    const characterName = nameMatch ? nameMatch[1] : characterDescription.split(' ').slice(0, 3).join(' ');

    const characterExists = savedCharacters.some(c => c.name.toLowerCase() === characterName.toLowerCase() || c.description === characterDescription);

    if (!characterExists && storyToSave.parts[0]?.imageUrl) {
        const newCharacter: Omit<Character, 'id'> = {
            name: characterName,
            description: characterDescription,
            imageUrl: storyToSave.parts[0]?.imageUrl
        };
        await handleAddCharacter(newCharacter);
    }
  };

  const handleSaveFromHistory = async (storyToSave: HistoryItem) => {
    await handleSaveStory(storyToSave); // This will also remove it from history
    alert('Story saved to your library!');
  };

  const handleImportStory = async (storyData: Omit<SavedStory, 'id' | 'createdAt'>) => {
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
    await addStory(newStory);
    alert("Story imported successfully!");
  };


  const handleDeleteStory = async (storyId: string) => {
    await deleteStory(storyId);
  };

  const handleReadStory = async (story: GeneratedStory | SavedStory | HistoryItem) => {
    setStoryForReader(story);
    
    // Add to history if it's a new story and not already there
    const isSaved = 'createdAt' in story;
    if (!isSaved) {
        const isAlreadyInHistory = history.some(h => h.title === story.title && h.prompt.plot === story.prompt.plot);
        if (!isAlreadyInHistory) {
            // Store the FULL story item in history now that we use IndexedDB
            const historyItem: HistoryItem = {
                ...story,
                id: `history-${Date.now()}`,
                readAt: new Date().toISOString(),
            };
            await addHistoryItem(historyItem);
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

  const handleAddCharacter = async (character: Omit<Character, 'id'>) => {
    const newCharacter: Character = {
      ...character,
      id: `char-${Date.now()}`,
    };
    await addCharacterDB(newCharacter);
  };

  const handleDeleteCharacter = async (characterId: string) => {
    await deleteCharacterDB(characterId);
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
                onSave={('createdAt' in storyForReader) ? undefined : handleSaveStory}
                isSaved={isStoryForReaderSaved}
            />
        )}
    </Layout>
  );
};

export default App;