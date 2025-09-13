import React, { useState, useEffect } from 'react';
import type { SavedStory } from '../types';
import { encodeStory } from '../utils/storyShare';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ShareIcon } from './icons/ShareIcon';
import { CopyIcon } from './icons/CopyIcon';

interface ShareModalProps {
  story: SavedStory;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ story, isOpen, onClose }) => {
  const [shareLink, setShareLink] = useState('');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Check for navigator.share and ensure it's in a client-side context
    if (typeof window !== 'undefined' && navigator.share) {
      setCanShare(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setError(null);
      setShowCopiedMessage(false);
      setShareLink('');

      try {
        const shareCode = encodeStory(story);
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set('import', shareCode);
        setShareLink(url.toString());
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while creating the share link.';
        console.error("Error creating share link:", e);
        setError(errorMessage);
      }
    }
  }, [isOpen, story]);

  const handleCopy = () => {
    if (!shareLink || showCopiedMessage) return;
    navigator.clipboard.writeText(shareLink).then(() => {
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2500);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };
  
  const handleWebShare = async () => {
    if (!shareLink || !canShare) return;
    try {
      await navigator.share({
        title: story.title,
        text: `Check out this story I made: "${story.title}"`,
        url: shareLink,
      });
    } catch (err) {
      // This error often happens if the user cancels the share dialog, so we can safely ignore it.
      console.log('Web Share API error:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Story">
      {error ? (
        <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
            <h3 className="font-bold mb-2">Could Not Create Share Link</h3>
            <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[--text-secondary]">
            Send this link to a friend so they can import your story into their library!
          </p>
          <div>
            <Input
              id="share-link"
              label="Shareable Link"
              value={shareLink}
              readOnly
              className="font-mono text-sm"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <div className="h-5 mt-1">
                {showCopiedMessage && (
                  <p className="text-sm text-green-400 animate-fade-in" aria-live="polite">
                    Link copied to clipboard!
                  </p>
                )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
            {canShare && (
              <Button onClick={handleWebShare} size="md" className="w-full sm:w-auto">
                <ShareIcon className="w-5 h-5 mr-2" />
                Share via...
              </Button>
            )}
            <Button onClick={handleCopy} disabled={!shareLink} size="md" className="w-full sm:w-auto">
              <CopyIcon className="w-5 h-5 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};