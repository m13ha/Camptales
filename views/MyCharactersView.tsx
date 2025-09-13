import React, { useState } from 'react';
import type { Character } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TrashIcon } from '../components/icons/TrashIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { CreateCharacterModal } from '../components/CreateCharacterModal';
import { PlusIcon } from '../components/icons/PlusIcon';

interface MyCharactersViewProps {
  characters: Character[];
  onAdd: (character: Omit<Character, 'id'>) => void;
  onDelete: (characterId: string) => void;
}

export const MyCharactersView: React.FC<MyCharactersViewProps> = ({ characters, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
        <CreateCharacterModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAdd={onAdd}
        />
        
        <Button
            onClick={() => setIsModalOpen(true)}
            className="!p-4 fixed bottom-20 md:bottom-8 right-8 z-40"
            aria-label="Create New Character"
            title="Create New Character"
        >
            <PlusIcon className="w-6 h-6" />
        </Button>

        <div className="max-w-4xl mx-auto">
            {characters.length === 0 ? (
                <Card className="text-center p-10 flex flex-col items-center justify-center">
                    <UsersIcon className="w-16 h-16 mx-auto text-[--text-secondary] mb-4" />
                    <h3 className="text-2xl font-bold text-[--text-primary]">No Characters Saved</h3>
                    <p className="text-[--text-secondary] mt-2">Click "Create New Character" to bring your first friend to life!</p>
                </Card>
            ) : (
                <div className="space-y-4"> 
                {characters.map(char => (
                    <Card key={char.id} className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        {char.imageUrl ? (
                            <img src={char.imageUrl} alt={char.name} className="w-full sm:w-24 h-auto sm:h-24 rounded-lg object-cover border-2 border-[--border] flex-shrink-0" />
                        ) : (
                            <div className="w-full aspect-square sm:w-24 sm:h-24 rounded-lg bg-[--input-background] flex items-center justify-center text-[--text-secondary] text-4xl font-bold flex-shrink-0">?</div>
                        )}
                        <div className="flex-grow w-full">
                            <h3 className="text-xl font-bold">{char.name}</h3>
                            <p className="text-[--text-secondary] text-sm leading-relaxed mt-1">{char.description}</p>
                        </div>
                        <div className="flex-shrink-0 w-full sm:w-auto flex justify-end">
                            <Button 
                                onClick={() => {
                                    if(window.confirm(`Are you sure you want to delete ${char.name}?`)) {
                                        onDelete(char.id)
                                    }
                                }}
                                variant="danger"
                                size="sm"
                                className="!p-3"
                                aria-label={`Delete ${char.name}`}
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </Button>
                        </div>
                    </Card>
                ))}
                </div>
            )}
        </div>
    </div>
  );
};