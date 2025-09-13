import React, { useState } from 'react';
import type { Character } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { UsersIcon } from './icons/UsersIcon';
import { generateCharacterImage } from '../services/geminiService';

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (character: Omit<Character, 'id'>) => void;
  onError: (message: string) => void;
}

export const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({ isOpen, onClose, onAdd, onError }) => {
  const [newChar, setNewChar] = useState({
    name: '',
    description: '',
    imageUrl: null as string | null,
  });
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const handleGeneratePreview = async () => {
    if (!newChar.description.trim() || isGeneratingPreview) return;
    setIsGeneratingPreview(true);
    try {
      const imageUrl = await generateCharacterImage(newChar.description);
      setNewChar(prev => ({ ...prev, imageUrl }));
    } catch (err) {
      console.error("Failed to generate preview image:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      onError(`Could not generate portrait: ${errorMessage}`);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleSaveCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChar.name.trim() || !newChar.description.trim() || !newChar.imageUrl) {
        onError("Please make sure you have a description, a generated portrait, and a name for your character.");
        return;
    };

    onAdd({
      name: newChar.name,
      description: newChar.description,
      imageUrl: newChar.imageUrl,
    });

    handleClose();
  };
  
  const handleClose = () => {
    setNewChar({ name: '', description: '', imageUrl: null });
    setIsGeneratingPreview(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Character">
      <form onSubmit={handleSaveCharacter}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column: Image Preview */}
          <div className="aspect-square bg-[--input-background] border-2 border-dashed border-[--border] rounded-lg flex items-center justify-center overflow-hidden relative">
              {isGeneratingPreview && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                  </div>
              )}
              {newChar.imageUrl ? (
                  <img src={newChar.imageUrl} alt="Character preview" className="w-full h-full object-cover" />
              ) : (
                  <div className="text-center text-[--text-secondary] p-4">
                      <UsersIcon className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm font-semibold">Your character portrait will appear here</p>
                  </div>
              )}
          </div>

          {/* Right Column: Form Fields */}
          <div className="flex flex-col space-y-4">
              <Textarea
                  id="char-desc"
                  label="1. Describe your character"
                  value={newChar.description}
                  onChange={(e) => setNewChar(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., A tiny dragon the size of a teacup..."
                  required
                  disabled={isGeneratingPreview}
                  rows={4}
                  className="flex-grow"
              />
              
              <Button 
                  type="button" 
                  onClick={handleGeneratePreview}
                  disabled={isGeneratingPreview || !newChar.description.trim()}
                  className="w-full"
              >
                  {isGeneratingPreview ? 'Generating...' : '2. Generate Portrait'}
              </Button>

               <Input
                  id="char-name"
                  label="3. Name your character"
                  value={newChar.name}
                  onChange={(e) => setNewChar(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sparklewing"
                  required
                  disabled={!newChar.imageUrl}
              />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[--border]">
            <Button 
                type="button" 
                onClick={handleClose} 
                className="!bg-gray-600 hover:!bg-gray-700"
            >
                Cancel
            </Button>
            <Button 
                type="submit" 
                disabled={!newChar.name.trim() || !newChar.imageUrl} 
            >
                Save Character
            </Button>
        </div>
      </form>
    </Modal>
  );
};
