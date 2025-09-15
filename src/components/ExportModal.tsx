import React from 'react';
import type { SavedStory } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { FileJson, FileText } from 'lucide-react';

interface ExportModalProps {
  stories: SavedStory[];
  isOpen: boolean;
  onClose: () => void;
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ stories, isOpen, onClose, onExportPdf, isExportingPdf = false }) => {
  const isSingleStory = stories.length === 1;

  const handleDownloadJson = () => {
    if (stories.length === 0) return;
    try {
        const dataToExport = stories.length === 1 ? stories[0] : stories;
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const fileName = isSingleStory && stories[0].title
            ? `${stories[0].title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
            : `bedtales_export_${new Date().toISOString().split('T')[0]}.json`;

        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onClose();
    } catch (e) {
        alert("Could not create the export file.");
    }
  };

  const handleExportPdfClick = () => {
    if (onExportPdf && !isExportingPdf) {
        onExportPdf();
    }
  };

  const title = isSingleStory ? `Export "${stories[0]?.title}"` : `Export ${stories.length} Stories`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {onExportPdf && isSingleStory ? (
        <div>
          <p className="text-center text-[--text-secondary] mb-4">Choose your desired export format.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card onClick={handleDownloadJson} className="text-center p-6">
              <FileJson className="w-12 h-12 mx-auto mb-3 text-[--primary]" />
              <h3 className="font-bold text-lg">Download JSON</h3>
              <p className="text-sm text-[--text-secondary]">A file with all story and image data. Good for backups.</p>
            </Card>
            <Card
              onClick={handleExportPdfClick}
              className={`text-center p-6 ${isExportingPdf ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {isExportingPdf ? (
                <div className="w-12 h-12 mx-auto mb-3 text-[--primary] flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-[--primary]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <FileText className="w-12 h-12 mx-auto mb-3 text-[--primary]" />
              )}
              <h3 className="font-bold text-lg">{isExportingPdf ? 'Exporting...' : 'Download PDF'}</h3>
              <p className="text-sm text-[--text-secondary]">A printable document, perfect for reading offline.</p>
            </Card>
          </div>
        </div>
      ) : (
        <div>
            <h3 className="font-bold text-lg mb-2">Download as File</h3>
             <p className="text-sm text-[--text-secondary] mb-4">
                {isSingleStory
                    ? "Save a complete file of this story, including all illustrations. Perfect for backups or sharing with friends."
                    : `Save a complete file of all ${stories.length} selected stories, including their illustrations.`}
            </p>
            <Button onClick={handleDownloadJson} size="md" className="w-full">
                {isSingleStory ? 'Download Story File (.json)' : `Download All ${stories.length} (.json)`}
            </Button>
        </div>
      )}
    </Modal>
  );
};
