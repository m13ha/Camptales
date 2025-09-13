import React, { useState } from 'react';
import type { SavedStory } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TrashIcon } from '../components/icons/TrashIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import { UploadIcon } from '../components/icons/UploadIcon';
import { ImportModal } from '../components/ImportModal';

interface SavedStoriesViewProps {
  stories: SavedStory[];
  onView: (story: SavedStory) => void;
  onDelete: (storyId: string) => void;
  onImport: (storyData: Omit<SavedStory, 'id' | 'createdAt'>) => void;
}

export const SavedStoriesView: React.FC<SavedStoriesViewProps> = ({ stories, onView, onDelete, onImport }) => {
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    
  return (
    <div>
        <Button
            onClick={() => setImportModalOpen(true)}
            className="!p-4 fixed bottom-20 md:bottom-8 right-8 z-40"
            aria-label="Import Story"
            title="Import Story"
        >
            <UploadIcon className="w-6 h-6" />
        </Button>

        <ImportModal 
            isOpen={isImportModalOpen}
            onClose={() => setImportModalOpen(false)}
            onImport={onImport}
        />

        {stories.length === 0 ? (
            <Card className="text-center p-10">
                <BookOpenIcon className="w-16 h-16 mx-auto text-[--text-secondary] mb-4" />
                <h2 className="text-2xl font-bold text-[--text-primary]">No Saved Stories Yet</h2>
                <p className="text-[--text-secondary] mt-2">Go to the Creator to make your first magical tale, or import a story from a friend!</p>
            </Card>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((story) => (
                <Card key={story.id}>
                    <div className="flex flex-col h-full">
                        <img
                            src={story.parts[0]?.imageUrl}
                            alt={`Illustration for ${story.title}`}
                            className="w-full h-48 object-cover rounded-lg mb-4 border-2 border-[--border]"
                        />
                        <h3 className="text-xl font-bold text-[--text-primary] flex-grow">{story.title}</h3>
                        <p className="text-sm text-[--text-secondary] mt-1 mb-4">Created on {new Date(story.createdAt).toLocaleDateString()}</p>
                        <div className="flex gap-2 mt-auto">
                            <Button onClick={() => onView(story)} className="flex-1" size="sm">View</Button>
                            <Button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(window.confirm('Are you sure you want to delete this story?')) {
                                        onDelete(story.id);
                                    }
                                }}
                                variant="danger"
                                className="!p-3"
                                size="sm"
                                aria-label="Delete story"
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
            </div>
        )}
    </div>
  );
};