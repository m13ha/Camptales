import React, { useState } from 'react';
import type { GeneratedStory, SavedStory, HistoryItem } from '../types';
import { StoryDisplay } from '../components/StoryDisplay';
import { Button } from '../components/ui/Button';
import { SaveIcon } from '../components/icons/SaveIcon';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import { ShareIcon } from '../components/icons/ShareIcon';
import { ShareModal } from '../components/ShareModal';

interface StoryReaderViewProps {
  story: GeneratedStory | SavedStory | HistoryItem;
  onBack: () => void;
  onSave?: () => void;
  isSaved: boolean;
}

export const StoryReaderView: React.FC<StoryReaderViewProps> = ({ story, onBack, onSave, isSaved }) => {
  const [isShareModalOpen, setShareModalOpen] = useState(false);

  const canBeShared = 'createdAt' in story;

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <Button onClick={onBack} size="sm">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </Button>

        {canBeShared && (
          <Button onClick={() => setShareModalOpen(true)} size="sm">
             <ShareIcon className="w-5 h-5 mr-2" />
             Share
          </Button>
        )}
      </div>
      
      <StoryDisplay story={story} />
      
      {onSave && (
        <div className="text-center mt-8">
            <Button onClick={onSave} disabled={isSaved} size="lg">
                <SaveIcon className="w-5 h-5 mr-2" />
                {isSaved ? 'Story Saved!' : 'Save This Story'}
            </Button>
        </div>
      )}

      {canBeShared && (
         <ShareModal 
            isOpen={isShareModalOpen}
            onClose={() => setShareModalOpen(false)}
            story={story as SavedStory}
         />
      )}
    </div>
  );
};