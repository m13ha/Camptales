import React, { useState, useEffect } from 'react';
import type { SavedStory, StoryPart } from '../types';
import { decodeStory, DecodedStory } from '../utils/storyShare';
import { generateStoryIllustration } from '../services/geminiService';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { useSettings } from '../contexts/SettingsContext';
import { storyLayouts } from '../layouts';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (storyData: Omit<SavedStory, 'id' | 'createdAt'>) => void;
  initialCode?: string | null;
  onError: (message: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, initialCode, onError }) => {
  const [code, setCode] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const { storyLayout: currentUserLayout } = useSettings();

  useEffect(() => {
    if (isOpen) {
        setCode(initialCode || '');
        setIsImporting(false);
        setImportMessage('');
    }
  }, [isOpen, initialCode]);


  const handleImport = async () => {
    const inputValue = code.trim();
    if (!inputValue) {
      onError('Please paste a story link or code.');
      return;
    }

    let finalCode = inputValue;

    // Intelligently detect if the input is a URL and extract the code
    try {
        const url = new URL(inputValue);
        const codeFromUrl = url.searchParams.get('import');
        if (codeFromUrl) {
            finalCode = codeFromUrl;
        }
    } catch (e) {
        // Not a valid URL, so we assume `inputValue` is the code itself.
    }

    setIsImporting(true);

    try {
      // 1. Decode the story code to get text and image prompts
      const decodedData: DecodedStory = decodeStory(finalCode);
      const layoutForGeneration = decodedData.layout || currentUserLayout;
      const aspectRatio = storyLayouts[layoutForGeneration].aspectRatio;

      // 2. Re-generate images from the prompts
      const newStoryParts: StoryPart[] = [];
      for (const [index, part] of decodedData.parts.entries()) {
        setImportMessage(`Generating illustration ${index + 1} of ${decodedData.parts.length}...`);
        // Add a delay before each API call to avoid rate limiting to prevent 429 errors.
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5-second delay
        
        const imageUrl = await generateStoryIllustration(part.imagePrompt, aspectRatio);
        newStoryParts.push({
          paragraph: part.paragraph,
          imagePrompt: part.imagePrompt,
          imageUrl,
        });
      }
      
      // 3. Assemble the full story object
      const fullStoryData: Omit<SavedStory, 'id' | 'createdAt'> = {
        title: decodedData.title,
        prompt: decodedData.prompt,
        parts: newStoryParts,
        layout: layoutForGeneration,
      };

      // 4. Pass the complete story to the parent to be saved
      onImport(fullStoryData);
      setCode('');
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsImporting(false);
      setImportMessage('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import a Story">
      {isImporting ? (
        <div className="text-center p-4">
           <svg className="animate-spin mx-auto h-8 w-8 text-[--primary] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg text-[--text-secondary]">{importMessage || "Preparing to import..."}</p>
        </div>
      ) : (
        <>
          <p className="text-[--text-secondary] mb-4">
            Paste the share link or story code you received from a friend below.
          </p>
          <Textarea
            id="import-code"
            label="Share Link or Story Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={6}
            placeholder="Paste share link or code here..."
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={onClose} variant="primary" className="!bg-gray-600 hover:!bg-gray-700">Cancel</Button>
            <Button onClick={handleImport}>Import Story</Button>
          </div>
        </>
      )}
    </Modal>
  );
};
