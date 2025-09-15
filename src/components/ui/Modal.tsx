import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const sizeClass = size === 'md' ? 'max-w-lg' : 'max-w-3xl';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = ''; // Restore background scrolling
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`bg-[--card-background] border border-[--border] rounded-xl shadow-2xl w-full ${sizeClass} modal-fade-in flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between p-6 pb-4">
          <h2 id="modal-title" className="text-2xl font-bold text-[--text-primary]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[--text-secondary] hover:text-[--text-primary] transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto px-6 pb-6">{children}</div>
      </div>
    </div>
  );
};
