import React, { useState, useEffect } from 'react';
import type { SavedStory } from '../types';
import { encodeStory } from '../utils/storyShare';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';

interface ShareModalProps {
  story: SavedStory;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ story, isOpen, onClose }) => {
  const [shareCode, setShareCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShareCode(encodeStory(story));
      setCopied(false);
    }
  }, [isOpen, story]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Story">
      <p className="text-[--text-secondary] mb-4">
        Copy this code and send it to a friend. They can import it into their own library!
      </p>
      <Textarea
        id="share-code"
        label="Story Code"
        value={shareCode}
        readOnly
        rows={6}
        className="font-mono text-sm"
        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
      />
      <div className="mt-4 text-right">
        <Button onClick={handleCopy} disabled={copied}>
          {copied ? 'Copied to Clipboard!' : 'Copy Code'}
        </Button>
      </div>
    </Modal>
  );
};
