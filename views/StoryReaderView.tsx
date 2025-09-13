import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import type { GeneratedStory, SavedStory, HistoryItem } from '../types';
import { StoryDisplay } from '../components/StoryDisplay';
import { Button } from '../components/ui/Button';
import { SaveIcon } from '../components/icons/SaveIcon';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import { ShareIcon } from '../components/icons/ShareIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { ShareModal } from '../components/ShareModal';
import { SpeakerOnIcon } from '../components/icons/SpeakerOnIcon';
import { SpeakerOffIcon } from '../components/icons/SpeakerOffIcon';
import { useSettings } from '../contexts/SettingsContext';

interface StoryReaderViewProps {
  story: GeneratedStory | SavedStory | HistoryItem;
  onBack: () => void;
  onSave?: (story: GeneratedStory | SavedStory | HistoryItem) => void;
  isSaved: boolean;
}

export const StoryReaderView: React.FC<StoryReaderViewProps> = ({ story, onBack, onSave, isSaved }) => {
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState(-1);
  const [isExporting, setIsExporting] = useState(false);
  const { speechRate, speechPitch, speechVoice } = useSettings();

  // Guard clause to prevent crashes from malformed story data (e.g., from old storage versions)
  if (!story || !Array.isArray(story.parts)) {
    return (
      <div className="w-full text-center p-8 bg-[--card-background] rounded-lg">
        <h2 className="text-2xl font-bold text-[--danger]">Story Error</h2>
        <p className="mt-2 text-[--text-secondary]">
          There was a problem loading this story's content. It might be corrupted or in an outdated format.
        </p>
        <Button onClick={onBack} size="sm" className="mt-6">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Stop speaking when the component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

    const handleExportPdf = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 40;
            const contentWidth = pageWidth - margin * 2;
            let yPos = margin;

            // --- 1. Add Story Title ---
            // The title is set in a larger, bold font and centered.
            // It's also wrapped if it's too long to fit on one line.
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            const titleLines = doc.splitTextToSize(story.title, contentWidth);
            doc.text(titleLines, pageWidth / 2, yPos, { align: 'center' });
            yPos += doc.getTextDimensions(titleLines).h + 30; // Add space after title

            // --- 2. Add Story Parts (Image + Paragraph) ---
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            
            for (const part of story.parts) {
                if (!part.imageUrl) continue; // Skip parts without images

                const imageMaxHeight = pageHeight * 0.4; // Max 40% of page height

                // --- Image Processing ---
                const img = new Image();
                img.src = part.imageUrl;
                // This ensures the image is loaded before we try to add it to the PDF
                await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });

                // Scale image to fit content width while maintaining aspect ratio
                const imgRatio = img.width / img.height;
                let imgWidth = contentWidth;
                let imgHeight = imgWidth / imgRatio;

                // If the scaled image is too tall, scale it down based on max height
                if (imgHeight > imageMaxHeight) {
                    imgHeight = imageMaxHeight;
                    imgWidth = imgHeight * imgRatio;
                }
                
                const imgX = (pageWidth - imgWidth) / 2; // Center the image

                // --- Text Processing ---
                // The text is wrapped to fit the content width.
                const textLines = doc.splitTextToSize(part.paragraph, contentWidth);
                const textHeight = doc.getTextDimensions(textLines).h;

                // --- Page Break Logic ---
                // Check if the current part (image + text) fits on the remaining page space.
                // If not, add a new page before drawing this part.
                if (yPos + imgHeight + textHeight + 20 > pageHeight - margin) {
                    doc.addPage();
                    yPos = margin; // Reset y-position for the new page
                }

                // --- Drawing Content ---
                doc.addImage(img.src, 'PNG', imgX, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 20; // Move y-position down past the image
                
                doc.text(textLines, margin, yPos);
                yPos += textHeight + 40; // Add space before the next story part
            }
            
            // --- 3. Save the PDF ---
            // The filename is sanitized to remove special characters.
            const sanitizedTitle = story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            doc.save(`${sanitizedTitle || 'story'}.pdf`);

        } catch (err) {
            console.error("Error exporting PDF:", err);
            alert("Sorry, an error occurred while creating the PDF.");
        } finally {
            setIsExporting(false);
        }
    };

  const handleToggleSpeech = useCallback(() => {
    if (!('speechSynthesis' in window)) {
        alert("Sorry, your browser doesn't support text-to-speech.");
        return;
    }

    if (isSpeaking) {
        speechSynthesis.cancel();
        // The onend event of the utterance will not fire when cancelled, so we manually reset state.
        setIsSpeaking(false);
        setCurrentSpeechIndex(-1);
    } else {
        setIsSpeaking(true);
        speechSynthesis.cancel(); // Clear any leftovers just in case

        const partsToRead = story.parts;
        const voices = speechSynthesis.getVoices();
        const selectedVoice = speechVoice ? voices.find(v => v.name === speechVoice) : null;
        
        partsToRead.forEach((part, index) => {
            const utterance = new SpeechSynthesisUtterance(part.paragraph);
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            utterance.rate = speechRate;
            utterance.pitch = speechPitch;

            utterance.onstart = () => {
                setCurrentSpeechIndex(index);
            };

            if (index === partsToRead.length - 1) {
                utterance.onend = () => {
                    setIsSpeaking(false);
                    setCurrentSpeechIndex(-1);
                };
            }

            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
                setIsSpeaking(false);
                setCurrentSpeechIndex(-1);
                if (index === 0) {
                     alert("An error occurred during text-to-speech.");
                }
            };

            speechSynthesis.speak(utterance);
        });
    }
  }, [isSpeaking, story.parts, speechRate, speechPitch, speechVoice]);

  const canBeShared = 'createdAt' in story;

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <Button onClick={onBack} size="sm">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-2">
            <Button onClick={handleToggleSpeech} size="sm">
                {isSpeaking ? (
                    <>
                        <SpeakerOffIcon className="w-5 h-5 mr-2" />
                        Stop Reading
                    </>
                ) : (
                    <>
                        <SpeakerOnIcon className="w-5 h-5 mr-2" />
                        Read Aloud
                    </>
                )}
            </Button>
             <Button onClick={handleExportPdf} size="sm" disabled={isExporting}>
                {isExporting ? (
                    <>
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Exporting...
                    </>
                ) : (
                    <>
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Export PDF
                    </>
                )}
            </Button>
            {canBeShared && (
            <Button onClick={() => setShareModalOpen(true)} size="sm">
                <ShareIcon className="w-5 h-5 mr-2" />
                Share
            </Button>
            )}
        </div>
      </div>
      
      <StoryDisplay story={story} isSpeaking={isSpeaking} currentSpeechIndex={currentSpeechIndex} />
      
      {onSave && (
        <div className="text-center mt-8">
            <Button onClick={() => onSave(story)} disabled={isSaved} size="lg">
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