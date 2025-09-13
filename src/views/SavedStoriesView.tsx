import React, { useState, useEffect, useMemo } from 'react';
import type { SavedStory } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TrashIcon } from '../components/icons/TrashIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { ImportModal } from '../components/ImportModal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SearchIcon } from '../components/icons/SearchIcon';

interface SavedStoriesViewProps {
  stories: SavedStory[];
  onView: (story: SavedStory) => void;
  onDelete: (storyId: string) => void;
  onImport: (storyData: Omit<SavedStory, 'id' | 'createdAt'>) => void;
  importCodeFromUrl?: string | null;
  onImportCodeUsed?: () => void;
  onError: (message: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

export const SavedStoriesView: React.FC<SavedStoriesViewProps> = ({ stories, onView, onDelete, onImport, importCodeFromUrl, onImportCodeUsed, onError }) => {
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOption>('newest');

    useEffect(() => {
        if (importCodeFromUrl) {
            setImportModalOpen(true);
        }
    }, [importCodeFromUrl]);
    
    const filteredAndSortedStories = useMemo(() => {
        const filtered = stories.filter(story =>
            story.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return [...filtered].sort((a, b) => {
            switch (sortOrder) {
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'newest':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });
    }, [stories, searchQuery, sortOrder]);

  const handleModalClose = () => {
    setImportModalOpen(false);
    if (onImportCodeUsed) {
        onImportCodeUsed();
    }
  };
    
  return (
    <div>
        <Button
            onClick={() => setImportModalOpen(true)}
            className="!p-4 fixed bottom-20 md:bottom-8 right-8 z-40"
            aria-label="Import Story"
            title="Import Story"
        >
            <DownloadIcon className="w-6 h-6" />
        </Button>

        <ImportModal 
            isOpen={isImportModalOpen}
            onClose={handleModalClose}
            onImport={onImport}
            initialCode={importCodeFromUrl}
            onError={onError}
        />

        {stories.length > 0 && (
             <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Input
                        id="search-stories"
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 !py-2.5 w-full"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--text-secondary] pointer-events-none" />
                </div>
                <Select
                    id="sort-stories"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOption)}
                    containerClassName="flex-shrink-0 md:max-w-xs w-full md:w-auto"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                </Select>
            </div>
        )}

        {filteredAndSortedStories.length === 0 ? (
            <Card className="text-center p-10">
                <BookOpenIcon className="w-16 h-16 mx-auto text-[--text-secondary] mb-4" />
                 {stories.length === 0 ? (
                    <>
                        <h2 className="text-2xl font-bold text-[--text-primary]">No Saved Stories Yet</h2>
                        <p className="text-[--text-secondary] mt-2">Go to the Creator to make your first magical tale, or import a story from a friend!</p>
                    </>
                 ) : (
                    <>
                        <h2 className="text-2xl font-bold text-[--text-primary]">No Matching Stories Found</h2>
                        <p className="text-[--text-secondary] mt-2">
                            Try adjusting your search query or sort options to find what you're looking for.
                        </p>
                        {searchQuery && (
                            <Button
                                onClick={() => setSearchQuery('')}
                                size="sm"
                                className="mt-4"
                            >
                                Clear Search
                            </Button>
                        )}
                    </>
                 )}
            </Card>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedStories.map((story) => (
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
