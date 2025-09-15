import React from 'react';
import { Modal } from './ui/Modal';
import { Card } from './ui/Card';
import { Link, Upload } from 'lucide-react';

interface ImportChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLink: () => void;
  onSelectFile: () => void;
}

export const ImportChoiceModal: React.FC<ImportChoiceModalProps> = ({ isOpen, onClose, onSelectLink, onSelectFile }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How would you like to import?">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card onClick={onSelectLink} className="text-center p-8">
          <Link className="w-12 h-12 mx-auto mb-4 text-[--primary]" />
          <h3 className="font-bold text-lg">From Share Link</h3>
          <p className="text-sm text-[--text-secondary]">Paste a link or code to regenerate a story.</p>
        </Card>
        <Card onClick={onSelectFile} className="text-center p-8">
          <Upload className="w-12 h-12 mx-auto mb-4 text-[--primary]" />
          <h3 className="font-bold text-lg">From JSON File</h3>
          <p className="text-sm text-[--text-secondary]">Upload a file to instantly add stories with their images.</p>
        </Card>
      </div>
    </Modal>
  );
};