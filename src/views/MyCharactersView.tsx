import React, { useState } from 'react';
import type { Character } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trash2, Users, Plus } from 'lucide-react';
import { CreateCharacterModal } from '../components/CreateCharacterModal';
import { CharacterPreviewModal } from '../components/CharacterPreviewModal';

interface MyCharactersViewProps {
  characters: Character[];
  onAdd: (character: Omit<Character, 'id' | 'createdAt'>) => void;
  onDelete: (characterId: string) => void;
  onError: (message: string) => void;
}

export const MyCharactersView: React.FC<MyCharactersViewProps> = ({ characters, onAdd, onDelete, onError }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [characterToPreview, setCharacterToPreview] = useState<Character | null>(null);

  const handlePreviewCharacter = (character: Character) => {
    setCharacterToPreview(character);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewModalOpen(false);
    setCharacterToPreview(null);
  };

  return (
    <div>
        <CharacterPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={handleClosePreview}
            character={characterToPreview}
        />
        <CreateCharacterModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onAdd={onAdd}
            onError={onError}
        />
        
        <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="!p-4 fixed bottom-20 md:bottom-8 right-8 z-40"
            aria-label="Create New Character"
            title="Create New Character"
        >
            <Plus className="w-6 h-6" />
        </Button>

        <div className="max-w-4xl mx-auto">
            {characters.length === 0 ? (
                <Card className="text-center p-10 flex flex-col items-center justify-center">
                    <Users className="w-16 h-16 mx-auto text-[--text-secondary] mb-4" />
                    <h3 className="text-2xl font-bold text-[--text-primary]">No Characters Saved</h3>
                    <p className="text-[--text-secondary] mt-2">Click "Create New Character" to bring your first friend to life!</p>
                </Card>
            ) : (
                <div className="space-y-4"> 
                {characters.map(char => (
                    <Card key={char.id} className="!p-3" onClick={() => handlePreviewCharacter(char)}>
                        <div className="flex items-center gap-4">
                            {char.imageUrl ? (
                                <img src={char.imageUrl} alt={char.name} className="w-16 h-16 rounded-full object-cover border-2 border-[--border] flex-shrink-0" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-[--input-background] flex items-center justify-center text-[--text-secondary] text-2xl font-bold flex-shrink-0">?</div>
                            )}
                            <div className="flex-grow min-w-0">
                                <h3 className="text-lg font-bold text-[--text-primary] truncate">{char.name}</h3>
                                <p className="text-[--text-secondary] text-sm leading-relaxed mt-1 line-clamp-2">{char.description}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <Button 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click when deleting
                                        if(window.confirm(`Are you sure you want to delete ${char.name}?`)) {
                                            onDelete(char.id)
                                        }
                                    }}
                                    variant="danger"
                                    size="sm"
                                    className="!p-3"
                                    aria-label={`Delete ${char.name}`}
                                >
                                    <Trash2 className="w-5 h-5"/>
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
                </div>
            )}
        </div>
    </div>
  );
};