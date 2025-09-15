import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { SavedStory } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trash2, BookOpen, Download, Search, X, Share2, MoreVertical, Heart } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { ExportModal } from '../components/ExportModal';
import { useWindowSize } from '../hooks/useWindowSize';

interface SavedStoriesViewProps {
  stories: SavedStory[];
  onView: (story: SavedStory) => void;
  onDelete: (storyId: string) => void;
  onDeleteMultiple: (storyIds: string[]) => void;
  onBulkImport: (stories: SavedStory[]) => void;
  onError: (message: string) => void;
  onToggleFavorite: (storyId: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

export const SavedStoriesView: React.FC<SavedStoriesViewProps> = ({ stories, onView, onDelete, onDeleteMultiple, onBulkImport, onError, onToggleFavorite }) => {
    const [isExportModalOpen, setExportModalOpen] = useState(false);
    const [storiesToExport, setStoriesToExport] = useState<SavedStory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOption>('newest');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [selectedStories, setSelectedStories] = useState(new Set<string>());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [confirmModalProps, setConfirmModalProps] = useState<any>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const longPressTimer = useRef<number | undefined>(undefined);
    const wasLongPress = useRef(false);
    const { width } = useWindowSize();

    const getTitleTruncateLength = () => {
        if (!width) return 15; // Fallback for initial render
        if (width < 768) { // Mobile devices
            return 15;
        } else if (width < 1024) { // Tablet devices
            return 30;
        } else { // PC
            return 50;
        }
    };
    const truncateLength = getTitleTruncateLength();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const filteredAndSortedStories = useMemo(() => {
        let filtered = stories;

        if (showFavoritesOnly) {
            filtered = filtered.filter(story => story.isFavorite);
        }

        if (searchQuery) {
            filtered = filtered.filter(story =>
                story.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

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
    }, [stories, searchQuery, sortOrder, showFavoritesOnly]);

    const areAllVisibleSelected = filteredAndSortedStories.length > 0 && selectedStories.size === filteredAndSortedStories.length;

    useEffect(() => {
        if (selectedStories.size === 0 && isSelectionMode) {
            setIsSelectionMode(false);
        }
    }, [selectedStories, isSelectionMode]);

    const handleToggleSelection = (storyId: string) => {
        setSelectedStories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(storyId)) {
                newSet.delete(storyId);
            } else {
                newSet.add(storyId);
            }
            return newSet;
        });
    };

    const handleToggleSelectAll = () => {
        if (areAllVisibleSelected) {
            setSelectedStories(new Set());
        } else {
            setSelectedStories(new Set(filteredAndSortedStories.map(s => s.id)));
        }
    };
    
    const handleCancelSelection = () => {
        setIsSelectionMode(false);
        setSelectedStories(new Set());
    };

    const handleDeleteSelected = () => {
        setConfirmModalProps({
            isOpen: true,
            title: `Delete ${selectedStories.size} stories?`,
            message: 'Are you sure you want to permanently delete the selected stories? This action cannot be undone.',
            variant: 'danger',
            confirmText: 'Delete',
            onConfirm: () => {
                onDeleteMultiple(Array.from(selectedStories));
                handleCancelSelection();
                setConfirmModalProps(null);
            },
            onClose: () => setConfirmModalProps(null)
        });
    };
    
    const handleExportSelected = () => {
        const toExport = stories.filter(s => selectedStories.has(s.id));
        if (toExport.length > 0) {
            setStoriesToExport(toExport);
            setExportModalOpen(true);
            handleCancelSelection();
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File could not be read as text.");
                }
                
                let data;
                try {
                    data = JSON.parse(text);
                } catch (jsonError) {
                    onError("Invalid JSON: The file is not formatted correctly and could not be read. Please select a valid BedTales JSON file.");
                    return;
                }

                if (data === null || typeof data !== 'object') {
                    onError("Invalid Format: The JSON file does not contain the expected story data. It might be empty or corrupted.");
                    return;
                }
                
                const storiesToImport = Array.isArray(data) ? data : (data.stories || [data]);
                onBulkImport(storiesToImport);

            } catch (error) {
                onError(error instanceof Error ? error.message : "An unexpected error occurred while importing the file.");
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };
        reader.readAsText(file);
    };

    const handlePointerDown = (storyId: string) => {
        wasLongPress.current = false;
        longPressTimer.current = window.setTimeout(() => {
            wasLongPress.current = true;
            if (!isSelectionMode) setIsSelectionMode(true);
            handleToggleSelection(storyId);
        }, 500);
    };

    const handlePointerUp = () => {
        clearTimeout(longPressTimer.current);
    };
    
    const handleCardClick = (story: SavedStory) => {
        if (wasLongPress.current) return;
        
        if (isSelectionMode) {
            handleToggleSelection(story.id);
        } else {
            onView(story);
        }
    };

  return (
    <div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json,application/json" className="hidden" />
        {confirmModalProps && <ConfirmationModal {...confirmModalProps} />}
        {!isSelectionMode && (
            <Button
                onClick={() => fileInputRef.current?.click()}
                className="!p-4 fixed bottom-20 md:bottom-8 right-8 z-40"
                aria-label="Import Story from File"
                title="Import Story from File"
            >
                <Download className="w-6 h-6" />
            </Button>
        )}
        
        <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setExportModalOpen(false)}
            stories={storiesToExport}
        />

        {stories.length > 0 && (
            <div className="mb-6">
                <div className="bg-[--input-background] border-2 border-[--border] rounded-lg transition-all duration-200">
                    {isSelectionMode ? (
                        <div className="w-full flex flex-wrap items-center justify-between gap-x-2 sm:gap-x-4 gap-y-2 animate-fade-in p-2">
                            <div className="flex items-center gap-2">
                                <Button onClick={handleCancelSelection} size="sm" className="!p-2.5 !bg-gray-600 hover:!bg-gray-700">
                                    <X className="w-5 h-5" />
                                </Button>
                                <span className="font-semibold text-lg text-[--text-primary]">{selectedStories.size} selected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={handleToggleSelectAll} size="sm">
                                    {areAllVisibleSelected ? 'Deselect All' : 'Select All'}
                                </Button>
                                <Button onClick={handleDeleteSelected} variant="danger" size="sm" className="!p-2.5" title="Delete selected">
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                                <Button onClick={handleExportSelected} size="sm" className="!p-2.5" title="Export selected">
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Desktop & Tablet Filter Bar */}
                            <div className="hidden sm:flex items-center gap-4 p-2">
                                <div className="relative w-full sm:flex-grow">
                                    <Input
                                        id="search-stories-desktop"
                                        placeholder="Search by title..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 w-full h-10 !bg-transparent !border-0 focus:!ring-0"
                                        aria-label="Search stories by title"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--text-secondary] pointer-events-none" />
                                </div>
                                
                                <div className="flex items-center gap-2 w-auto flex-shrink-0">
                                    <Select
                                        id="sort-stories-desktop"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value as SortOption)}
                                        className="!bg-transparent !border-0 focus:!ring-0 h-10 flex-grow"
                                        aria-label="Sort stories"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="oldest">Oldest</option>
                                        <option value="title-asc">Title A-Z</option>
                                        <option value="title-desc">Title Z-A</option>
                                    </Select>
                                    
                                    <div className="h-6 border-l-2 border-[--border]"></div>

                                    <button
                                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                        className={`p-2 h-10 rounded-md transition-colors ${showFavoritesOnly ? 'text-red-500' : 'text-[--text-secondary] hover:text-[--text-primary]'}`}
                                        title={showFavoritesOnly ? "Show all stories" : "Show favorites only"}
                                        aria-pressed={showFavoritesOnly}
                                        aria-label={showFavoritesOnly ? "Show all stories" : "Show favorite stories only"}
                                    >
                                        <Heart fill={showFavoritesOnly ? "currentColor" : "none"} className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Filter Bar */}
                            <div className="sm:hidden flex items-center justify-between p-2 min-h-[52px]">
                                {isSearchVisible ? (
                                    <div className="flex items-center gap-2 w-full animate-fade-in">
                                        <div className="relative flex-grow">
                                            <Input
                                                id="search-stories-mobile"
                                                placeholder="Search..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 w-full h-10 !bg-transparent !border-0 focus:!ring-0"
                                                autoFocus
                                                aria-label="Search stories by title"
                                            />
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--text-secondary] pointer-events-none" />
                                        </div>
                                        <button 
                                            onClick={() => { setIsSearchVisible(false); setSearchQuery(''); }}
                                            className="p-2 text-[--text-secondary] hover:text-[--text-primary]"
                                            aria-label="Close search"
                                        >
                                            <X className="w-5 h-5"/>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between w-full animate-fade-in">
                                        <Select
                                            id="sort-stories-mobile"
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value as SortOption)}
                                            className="!bg-transparent !border-0 focus:!ring-0 h-10 font-semibold"
                                            aria-label="Sort stories"
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="oldest">Oldest</option>
                                            <option value="title-asc">A-Z</option>
                                            <option value="title-desc">Z-A</option>
                                        </Select>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                                className={`p-2 h-10 rounded-md transition-colors ${showFavoritesOnly ? 'text-red-500' : 'text-[--text-secondary] hover:text-[--text-primary]'}`}
                                                title={showFavoritesOnly ? "Show all stories" : "Show favorites only"}
                                                aria-pressed={showFavoritesOnly}
                                                aria-label={showFavoritesOnly ? "Show all stories" : "Show favorite stories only"}
                                            >
                                                <Heart fill={showFavoritesOnly ? "currentColor" : "none"} className="w-5 h-5"/>
                                            </button>
                                            <button 
                                                onClick={() => setIsSearchVisible(true)}
                                                className="p-2 h-10 text-[--text-secondary] hover:text-[--text-primary]"
                                                aria-label="Open search"
                                            >
                                                <Search className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

        {filteredAndSortedStories.length === 0 ? (
            <Card className="text-center p-10">
                <BookOpen className="w-16 h-16 mx-auto text-[--text-secondary] mb-4" />
                 {stories.length === 0 ? (
                    <>
                        <h2 className="text-2xl font-bold text-[--text-primary]">No Saved Stories Yet</h2>
                        <p className="text-[--text-secondary] mt-2">Go to the Creator to make your first magical tale, or import a story from a friend!</p>
                    </>
                 ) : (
                    <>
                        <h2 className="text-2xl font-bold text-[--text-primary]">
                            {showFavoritesOnly ? "No Favorite Stories" : "No Matching Stories Found"}
                        </h2>
                        <p className="text-[--text-secondary] mt-2">
                            {showFavoritesOnly 
                                ? "Click the heart icon on a story to mark it as a favorite."
                                : "Try adjusting your search query or filters to find what you're looking for."
                            }
                        </p>
                        {searchQuery && !showFavoritesOnly && (
                            <Button
                                onClick={() => { setSearchQuery(''); setShowFavoritesOnly(false); }}
                                size="sm"
                                className="mt-4"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </>
                 )}
            </Card>
        ) : (
            <div className="space-y-4">
            {filteredAndSortedStories.map((story) => {
                const isSelected = selectedStories.has(story.id);
                return (
                    <Card
                        key={story.id}
                        onClick={() => handleCardClick(story)}
                        onPointerDown={() => handlePointerDown(story.id)}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        className={`!p-3 transition-all duration-200 ${isSelected ? 'border-[--primary] bg-[--primary]/10' : ''}`}
                    >
                        <div className="flex items-center gap-2 sm:gap-4">
                            {isSelectionMode && (
                                <div className="flex-shrink-0 self-center pl-1">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        readOnly
                                        className="h-5 w-5 rounded text-[--primary] bg-[--card-background] border-2 border-[--border] focus:ring-0 focus:ring-offset-0 pointer-events-none"
                                        aria-label={`Select story: ${story.title}`}
                                    />
                                </div>
                            )}
                             <div className="relative flex-shrink-0">
                                <img
                                    src={story.parts[0]?.imageUrl}
                                    alt=""
                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border-2 border-[--border]"
                                />
                                {!isSelectionMode && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(story.id); }}
                                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:text-red-400 transition-colors"
                                        title={story.isFavorite ? "Unfavorite" : "Favorite"}
                                    >
                                        <Heart fill={story.isFavorite ? "currentColor" : "none"} className={`w-4 h-4 ${story.isFavorite ? 'text-red-500' : ''}`} />
                                    </button>
                                )}
                            </div>
                            <div className="flex-grow min-w-0">
                                <h3 title={story.title} className="text-base sm:text-lg font-bold text-[--text-primary] truncate">
                                    {story.title.length > truncateLength ? `${story.title.substring(0, truncateLength)}...` : story.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-[--text-secondary] mt-1 truncate">Created on {new Date(story.createdAt).toLocaleDateString()}</p>
                            </div>
                            {!isSelectionMode && (
                                <div className="flex-shrink-0 relative">
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === story.id ? null : story.id);
                                        }}
                                        className="!p-2 !bg-transparent hover:!bg-white/10"
                                        aria-label="Story actions"
                                        aria-haspopup="true"
                                        aria-expanded={openMenuId === story.id}
                                    >
                                        <MoreVertical className="w-5 h-5 text-[--text-secondary]" />
                                    </Button>
                                    {openMenuId === story.id && (
                                        <div ref={menuRef} className="absolute top-full right-0 mt-2 w-48 bg-[--card-background] border border-[--border] rounded-lg shadow-xl py-1 z-20 animate-fade-in">
                                            <ul className="text-[--text-primary]">
                                                <li>
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation();
                                                            setOpenMenuId(null);
                                                            setConfirmModalProps({
                                                                isOpen: true,
                                                                title: `Delete "${story.title}"?`,
                                                                message: 'Are you sure you want to permanently delete this story?',
                                                                variant: 'danger',
                                                                confirmText: 'Delete',
                                                                onConfirm: () => { onDelete(story.id); setConfirmModalProps(null); },
                                                                onClose: () => setConfirmModalProps(null)
                                                            });
                                                        }} 
                                                        className="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-white/10 text-[--danger] transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Delete
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            )}
            </div>
        )}
    </div>
  );
};
