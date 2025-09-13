import React from 'react';
import type { HistoryItem } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { HistoryIcon } from '../components/icons/HistoryIcon';
import { SaveIcon } from '../components/icons/SaveIcon';

interface HistoryViewProps {
  historyItems: HistoryItem[];
  onView: (story: HistoryItem) => void;
  onSave: (story: HistoryItem) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ historyItems, onView, onSave }) => {
    
  return (
    <div>
        {historyItems.length === 0 ? (
            <Card className="text-center p-10">
                <HistoryIcon className="w-16 h-16 mx-auto text-[--text-secondary] mb-4" />
                <h2 className="text-2xl font-bold text-[--text-primary]">No Reading History Yet</h2>
                <p className="text-[--text-secondary] mt-2">Stories you read but don't save will appear here for a while.</p>
            </Card>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyItems.sort((a,b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime()).map((story) => (
                <Card key={story.id}>
                    <div className="flex flex-col h-full">
                        <img
                            src={story.parts[0]?.imageUrl}
                            alt={`Illustration for ${story.title}`}
                            className="w-full h-48 object-cover rounded-lg mb-4 border-2 border-[--border]"
                        />
                        <h3 className="text-xl font-bold text-[--text-primary] flex-grow">{story.title}</h3>
                        <p className="text-sm text-[--text-secondary] mt-1 mb-4">Read on {new Date(story.readAt).toLocaleDateString()}</p>
                        <div className="flex gap-2 mt-auto">
                            <Button onClick={() => onView(story)} className="flex-1" size="sm">Read Again</Button>
                            <Button 
                                onClick={() => onSave(story)}
                                size="sm"
                                className="!p-3"
                                aria-label="Save story"
                            >
                                <SaveIcon className="w-5 h-5"/>
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
