import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  if (!isOpen) {
    return null;
  }

  const Icon = variant === 'danger' ? AlertTriangle : Info;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${variant === 'danger' ? 'bg-[--danger]/20' : 'bg-[--primary]/20'} mb-4`}>
          <Icon className={`h-8 w-8 ${variant === 'danger' ? 'text-[--danger]' : 'text-[--primary]'}`} />
        </div>
        <p className="text-lg text-[--text-secondary] whitespace-pre-wrap">{message}</p>
        <div className="mt-6 flex justify-center gap-4">
          <Button onClick={onClose} variant="primary" className="!bg-gray-600 hover:!bg-gray-700">
            {cancelText}
          </Button>
          <Button onClick={onConfirm} variant={variant}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};