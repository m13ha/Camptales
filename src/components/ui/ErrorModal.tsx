import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string | null;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen || !message) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="An Error Occurred">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[--danger]/20 mb-4">
            <AlertTriangle className="h-8 w-8 text-[--danger]" />
        </div>
        <p className="text-lg text-[--text-secondary]">{message}</p>
        <div className="mt-6">
          <Button onClick={onClose} size="md">
            OK
          </Button>
        </div>
      </div>
    </Modal>
  );
};