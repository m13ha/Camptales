import React, { useState, useMemo } from 'react';
import type { HistoryItem, SavedStory } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { History, Save, Check } from 'lucide-react';
import { Select } from '../components/ui/Select';
import { useWindowSize } from '../hooks/useWindowSize';

interface HistoryViewProps {
  historyItems: HistoryItem[];
  onView: (story: HistoryItem) => void;
  onSave: (story: HistoryItem) => void;
  savedStories: SavedStory[];
}

type SortOption = 'newest' | 'oldest';

export const HistoryView: React.FC<HistoryViewProps> = ({ historyItems, onView, onSave, savedStories }) => {
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
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

  const sortedHistoryItems = useMemo(() => {
    return [...historyItems].sort((a, b) => {
        if (sortOrder === 'oldest') {
            return new Date(a.readAt).getTime() - new Date(b.readAt).getTime();
        }
        // Default to newest
        return new Date(b.readAt).getTime() - new Date(a.readAt).getTime();
    });
  }, [historyItems, sortOrder]);
    
  return (
    <div>
        {historyItems.length === 0 ? (
            <Card className="text-center p-10">
                <History className="w-16 h-16 mx-auto text-[--text-secondary] mb-4" />
                <h2 className="text-2xl font-bold text-[--text-primary]">No Reading History Yet</h2>
                <p className="text-[--text-secondary] mt-2">Stories you read but don't save will appear here for a while.</p>
            </Card>
        ) : (
            <>
              <div className="mb-6">
                <div className="bg-[--input-background] border-2 border-[--border] rounded-lg">
                    <div className="flex items-center justify-start p-2 min-h-[52px]">
                        <Select
                            id="sort-history"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as SortOption)}
                            className="!bg-transparent !border-0 focus:!ring-0 h-10 font-semibold"
                            aria-label="Sort history"
                        >
                            <option value="newest">Sort: Newest</option>
                            <option value="oldest">Sort: Oldest</option>
                        </Select>
                    </div>
                </div>
              </div>

              <div className="space-y-4">
                {sortedHistoryItems.map((story) => {
                    const isAlreadySaved = savedStories.some(savedStory => 
                        savedStory.title === story.title && savedStory.prompt.plot === story.prompt.plot
                    );
                    return (
                        <Card key={story.id} onClick={() => onView(story)} className="!p-3">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <img
                                    src={story.parts[0]?.imageUrl}
                                    alt="" // Decorative
                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border-2 border-[--border] flex-shrink-0"
                                />
                                <div className="flex-grow min-w-0">
                                    <h3 title={story.title} className="text-base sm:text-lg font-bold text-[--text-primary] truncate">
                                        {story.title.length > truncateLength ? `${story.title.substring(0, truncateLength)}...` : story.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-[--text-secondary] mt-1">Read on {new Date(story.readAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <Button 
                                        onClick={(e) => { e.stopPropagation(); onSave(story); }}
                                        size="sm"
                                        className="!p-3"
                                        aria-label={isAlreadySaved ? "Story is saved" : "Save story"}
                                        title={isAlreadySaved ? "Story is saved" : "Save story"}
                                        disabled={isAlreadySaved}
                                    >
                                        {isAlreadySaved ? <Check className="w-5 h-5"/> : <Save className="w-5 h-5"/>}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
              </div>
            </>
        )}
    </div>
  );
};
