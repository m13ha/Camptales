import React from 'react';
import type { Character } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Users } from 'lucide-react';

interface CharacterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character | null;
}

export const CharacterPreviewModal: React.FC<CharacterPreviewModalProps> = ({ isOpen, onClose, character }) => {
  if (!character) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Character Profile" size="xl">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Image Preview */}
        <div className="aspect-square bg-[--input-background] border-2 border-dashed border-[--border] rounded-lg flex items-center justify-center overflow-hidden">
          {character.imageUrl ? (
            <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-[--text-secondary] p-4">
              <Users className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm font-semibold">No portrait available</p>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-3xl font-bold text-[--text-primary] break-words">{character.name}</h3>
          <p className="text-lg leading-relaxed text-[--text-secondary] whitespace-pre-wrap">
            {character.description}
          </p>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[--border]">
        <Button
          type="button"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};