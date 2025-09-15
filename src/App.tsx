import React, { useState, useEffect } from 'react';
import type { SavedStory, Character, GeneratedStory, HistoryItem, AppSetting } from './types';
import { useIndexedDB } from './hooks/useIndexedDB';
import { getAll } from './services/dbService';
import { Layout } from './components/layout/Layout';
import { CreatorView } from './views/CreatorView';
import { SavedStoriesView } from './views/SavedStoriesView';
import { MyCharactersView } from './views/MyCharactersView';
import { SettingsView } from './views/SettingsView';
import { StoryReaderView } from './views/StoryReaderView';
import { HistoryView } from './views/HistoryView';
import { useSettings } from './contexts/SettingsContext';
import { AppearanceSettingsView } from './views/settings/AppearanceSettingsView';
import { TypographySettingsView } from './views/settings/TypographySettingsView';
import { ReadingSettingsView } from './views/settings/ReadingSettingsView';
import { DataSettingsView } from './views/settings/DataSettingsView';
import { AboutView } from './views/settings/AboutView';
import { ErrorModal } from './components/ui/ErrorModal';
import { SplashScreen } from './components/SplashScreen';


type View = 'create' | 'stories' | 'characters' | 'settings' | 'reader' | 'history';
export type SettingsViewType = 'main' | 'appearance' | 'typography' | 'reading' | 'data' | 'about';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('create');
  const [previousView, setPreviousView] = useState<View>('create');
  const [settingsView, setSettingsView] = useState<SettingsViewType>('main');
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isSplashFadingOut, setIsSplashFadingOut] = useState(false);
  
  const { data: savedStories, addItem: addStory, deleteItem: deleteStory, deleteMultipleItems: deleteStories, updateItem: updateStory, clearAllItems: clearStories, bulkAddItems: bulkAddStories } = useIndexedDB<SavedStory>('stories');
  const { data: savedCharacters, addItem: addCharacterDB, deleteItem: deleteCharacterDB, clearAllItems: clearCharacters, bulkAddItems: bulkAddCharacters } = useIndexedDB<Character>('characters');
  const { data: history, addItem: addHistoryItem, deleteItem: deleteHistoryItem, deleteMultipleItems: deleteHistoryItems, clearAllItems: clearHistory, bulkAddItems: bulkAddHistory } = useIndexedDB<HistoryItem>('history');
  const { bulkAddItems: bulkAddSettings } = useIndexedDB<AppSetting>('settings');
  
  const [storyForReader, setStoryForReader] = useState<GeneratedStory | SavedStory | HistoryItem | null>(null);
  const { historyRetention } = useSettings();
  const [appError, setAppError] = useState<string | null>(null);

  // Effect to manage the splash screen visibility for 10 seconds
  useEffect(() => {
    // Start the fade-out animation just before the 10-second mark
    const fadeOutTimer = setTimeout(() => {
      setIsSplashFadingOut(true);
    }, 9500); // 10000ms total - 500ms for fade animation

    // Remove the splash screen from the DOM after the animation completes
    const removeTimer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 10000);

    // Cleanup timers on component unmount
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const showErrorModal = (message: string | Error) => {
    if (typeof message === 'object' && message !== null && 'message' in message) {
        setAppError(message.message);
    } else if (typeof message === 'string') {
        setAppError(message);
    } else {
        console.error("Attempted to show non-string/non-error:", message);
        setAppError("An unexpected error occurred. Please check the console for details.");
    }
  };
  const hideErrorModal = () => setAppError(null);

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
    // Check if the story is already saved to prevent creating duplicates.
    const isAlreadySaved = savedStories.some(s => s.title === storyToSave.title && s.prompt.plot === storyToSave.prompt.plot);
    if (isAlreadySaved) {
        // If the user is trying to save from the reader and just generated audio,
        // we might still want to update the existing story with the audio.
        // For now, we simply prevent duplicate saves.
        console.log("Attempted to save a story that is already in the library.");
        return;
    }

    // 2. Save story
    const newStory: SavedStory = {
      ...storyToSave,
      id: `story-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await addStory(newStory);
    
    // If we just saved the story we were reading, update the reader view's story object
    // so it reflects the saved state (isSaved=true)
    if (storyForReader && storyForReader.title === newStory.title) {
      setStoryForReader(newStory);
    }


    // 3. Save character
    const characterDescription = storyToSave.prompt.character;
    
    const nameMatch = characterDescription.match(/named\s+([A-Z]\w+)/i);
    const characterName = nameMatch ? nameMatch[1] : characterDescription.split(' ').slice(0, 3).join(' ');

    const characterExists = savedCharacters.some(c => c.name.toLowerCase() === characterName.toLowerCase() || c.description === characterDescription);

    if (!characterExists && storyToSave.parts[0]?.imageUrl) {
        const newCharacter: Omit<Character, 'id' | 'createdAt'> = {
            name: characterName,
            description: characterDescription,
            imageUrl: storyToSave.parts[0]?.imageUrl
        };
        await handleAddCharacter(newCharacter);
    }
  };

  const handleUpdateStory = async (story: SavedStory) => {
    await updateStory(story);
    // Also update the story in the reader if it's the one being viewed
    if (storyForReader && 'id' in storyForReader && storyForReader.id === story.id) {
        setStoryForReader(story);
    }
  };

  const handleSaveFromHistory = async (storyToSave: HistoryItem) => {
    await handleSaveStory(storyToSave);
    alert('Story saved to your library!');
  };

  const handleBulkImportStories = async (importedStories: any[]) => {
    let validStories: SavedStory[] = [];
    let invalidItemCount = 0;

    for (const item of importedStories) {
        // A valid story must be an object with these specific properties.
        if (item && typeof item === 'object' && item.id && item.title && Array.isArray(item.parts) && item.prompt) {
            validStories.push(item as SavedStory);
        } else {
            invalidItemCount++;
        }
    }
    
    if (validStories.length === 0) {
        if (importedStories.length > 0) {
            showErrorModal("Import Failed: The file's data seems corrupted or isn't in the correct story format. Please check the file or try another backup.");
        } else {
            showErrorModal("Import Failed: The selected file doesn't contain any stories to import.");
        }
        return;
    }

    const newStories = validStories.filter(imported => 
        !savedStories.some(existing => existing.id === imported.id || (existing.title === imported.title && existing.prompt.plot === imported.prompt.plot))
    );
    
    const duplicateCount = validStories.length - newStories.length;

    if (newStories.length > 0) {
        await bulkAddStories(newStories);
    }
    
    // Build a summary message for the user.
    const messageParts: string[] = [];
    if (newStories.length > 0) {
        messageParts.push(`✅ Successfully imported ${newStories.length} new ${newStories.length === 1 ? 'story' : 'stories'}.`);
    }
    if (duplicateCount > 0) {
        messageParts.push(`ℹ️ Skipped ${duplicateCount} ${duplicateCount === 1 ? 'story' : 'stories'} that are already in your library.`);
    }
    if (invalidItemCount > 0) {
        messageParts.push(`⚠️ Skipped ${invalidItemCount} ${invalidItemCount === 1 ? 'item' : 'items'} due to corrupted or invalid data format.`);
    }
    
    const finalMessage = messageParts.join('\n\n');

    if (finalMessage) {
      alert(finalMessage);
    } else if (validStories.length > 0 && newStories.length === 0) {
      // This case is for when all valid stories were duplicates
      alert("✅ All stories in the file are already in your library.");
    }
  };


  const handleDeleteStory = async (storyId: string) => {
    await deleteStory(storyId);
  };

  const handleDeleteMultipleStories = async (storyIds: string[]) => {
    await deleteStories(storyIds);
  };

  const handleToggleFavoriteStory = async (storyId: string) => {
    const storyToUpdate = savedStories.find(s => s.id === storyId);
    if (storyToUpdate) {
        const updated = { ...storyToUpdate, isFavorite: !storyToUpdate.isFavorite };
        await updateStory(updated);
    }
  };

  const handleReadStory = async (story: GeneratedStory | SavedStory | HistoryItem) => {
    setStoryForReader(story);

    // Find if an item for this story already exists in history
    const existingHistoryItem = history.find(h => 
        h.title === story.title && h.prompt.plot === story.prompt.plot
    );

    if (existingHistoryItem) {
        // If it exists, update its readAt timestamp to bring it to the top
        const updatedItem = { ...existingHistoryItem, readAt: new Date().toISOString() };
        await addHistoryItem(updatedItem);
    } else {
        // If it doesn't exist, create a new history item
        // We explicitly take only the necessary properties to create a clean HistoryItem
        const newHistoryItem: HistoryItem = {
            title: story.title,
            parts: story.parts,
            prompt: story.prompt,
            layout: story.layout,
            id: `history-${Date.now()}`, // A unique ID for the history store
            readAt: new Date().toISOString(),
        };
        await addHistoryItem(newHistoryItem);
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

  const handleAddCharacter = async (character: Omit<Character, 'id' | 'createdAt'>) => {
    const newCharacter: Character = {
      ...character,
      id: `char-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await addCharacterDB(newCharacter);
  };

  const handleDeleteCharacter = async (characterId: string) => {
    await deleteCharacterDB(characterId);
  };
  
  const handleSetView = (view: View) => {
    if (view !== 'settings') {
      setSettingsView('main');
    }
    setCurrentView(view);
  }

    const handleExportData = async () => {
        try {
            // Fetch the latest version of all data directly from IndexedDB to ensure the backup is current.
            const [
                currentStories,
                currentHistory,
                currentCharacters,
                currentSettings,
            ] = await Promise.all([
                getAll<SavedStory>('stories'),
                getAll<HistoryItem>('history'),
                getAll<Character>('characters'),
                getAll<AppSetting>('settings'),
            ]);

            const backupData = {
                stories: currentStories,
                history: currentHistory,
                characters: currentCharacters,
                settings: currentSettings,
            };
            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().split('T')[0];
            a.href = url;
            a.download = `bedtales_backup_${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export data", error);
            showErrorModal("Could not create backup file. Please try again.");
        }
    };

    const handleImportData = async (data: any) => {
        try {
            // Core data is required.
            if (!data.stories || !data.history || !data.characters || !Array.isArray(data.stories)) {
                throw new Error("Invalid backup file structure. Core data (stories, history, characters) is missing.");
            }

            const importPromises: Promise<void>[] = [
                bulkAddStories(data.stories),
                bulkAddHistory(data.history),
                bulkAddCharacters(data.characters),
            ];

            // Conditionally add settings if they exist in the backup.
            if (data.settings && Array.isArray(data.settings)) {
                importPromises.push(bulkAddSettings(data.settings));
            }

            // The user is right, apiUsage should not be restored.
            // The rate limiter will recalculate based on imported story creation dates.

            await Promise.all(importPromises);

            alert("Backup restored successfully! The app will now reload to apply all settings.");
            window.location.reload();
        } catch (error) {
            console.error("Failed to import data", error);
            showErrorModal(error instanceof Error ? error.message : "An unknown error occurred during import.");
        }
    };

  const isStoryForReaderSaved = storyForReader ? savedStories.some(s => {
    if ('id' in storyForReader && 'createdAt' in storyForReader) {
        return s.id === storyForReader.id;
    }
    return s.title === storyForReader.title && s.prompt.plot === storyForReader.prompt.plot;
  }) : false;

  return (
    <>
      {isSplashVisible && <SplashScreen isFadingOut={isSplashFadingOut} />}
      <Layout 
        currentView={currentView} 
        setCurrentView={handleSetView}
        settingsView={settingsView}
        onBackToSettingsMain={() => setSettingsView('main')}
      >
          <ErrorModal 
              isOpen={!!appError}
              message={appError}
              onClose={hideErrorModal}
          />
          {currentView === 'create' && (
            <CreatorView 
              characters={savedCharacters} 
              onStoryGenerated={handleReadStory}
              onError={showErrorModal}
            />
          )}
          {currentView === 'stories' && (
            <SavedStoriesView 
              stories={savedStories}
              onView={handleReadStory}
              onDelete={handleDeleteStory}
              onDeleteMultiple={handleDeleteMultipleStories}
              onBulkImport={handleBulkImportStories}
              onError={showErrorModal}
              onToggleFavorite={handleToggleFavoriteStory}
            />
          )}
          {currentView === 'history' && (
            <HistoryView 
              historyItems={history}
              onView={handleReadStory}
              onSave={handleSaveFromHistory}
              savedStories={savedStories}
            />
          )}
          {currentView === 'characters' && (
            <MyCharactersView 
              characters={savedCharacters}
              onAdd={handleAddCharacter}
              onDelete={handleDeleteCharacter}
              onError={showErrorModal}
            />
          )}
          {currentView === 'settings' && (
            <>
              {settingsView === 'main' && <SettingsView onNavigate={setSettingsView} />}
              {settingsView === 'appearance' && <AppearanceSettingsView />}
              {settingsView === 'typography' && <TypographySettingsView />}
              {settingsView === 'reading' && <ReadingSettingsView />}
              {settingsView === 'data' && (
                <DataSettingsView 
                  onClearHistory={clearHistory}
                  onClearStories={clearStories}
                  onClearCharacters={clearCharacters}
                  onExport={handleExportData}
                  onImport={handleImportData}
                  onError={showErrorModal}
                />
              )}
              {settingsView === 'about' && <AboutView />}
            </>
          )}
          {currentView === 'reader' && storyForReader && (
              <StoryReaderView
                  story={storyForReader}
                  onBack={handleBackFromReader}
                  onSave={('createdAt' in storyForReader) ? undefined : handleSaveStory}
                  onUpdateStory={'createdAt' in storyForReader ? handleUpdateStory : undefined}
                  isSaved={isStoryForReaderSaved}
                  onError={showErrorModal}
              />
          )}
      </Layout>
    </>
  );
};

export default App;