import React, { useState, useEffect } from 'react';
import type { SavedStory } from '../types';
import { encodeStory } from '../utils/storyShare';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ShareModalProps {
  story: SavedStory;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ story, isOpen, onClose }) => {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setError(null);
      setCopied(false);
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
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Story">
      {error ? (
        <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
            <h3 className="font-bold mb-2">Could Not Create Share Link</h3>
            <p>{error}</p>
        </div>
      ) : (
        <>
          <p className="text-[--text-secondary] mb-4">
            Copy this link and send it to a friend. They can import your story into their library!
          </p>
          <Input
            id="share-link"
            label="Shareable Link"
            value={shareLink}
            readOnly
            className="font-mono text-sm"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <div className="mt-4 text-right">
            <Button onClick={handleCopy} disabled={copied || !shareLink}>
              {copied ? 'Link Copied!' : 'Copy Link'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};