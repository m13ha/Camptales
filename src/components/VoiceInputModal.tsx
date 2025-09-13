import React, { useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { StopCircleIcon } from './icons/StopCircleIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface VoiceInputModalProps {
  isOpen: boolean;
  onStop: () => void;
  stream: MediaStream | null;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ isOpen, onStop, stream }) => {
  const visualizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !stream || !visualizerRef.current) {
        return;
    }

    let animationFrameId: number;
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (const amplitude of dataArray) {
            sum += amplitude * amplitude;
        }
        const volume = Math.sqrt(sum / dataArray.length);

        const targetScale = 1 + (volume / 128);
        
        if (visualizerRef.current) {
            const currentTransform = visualizerRef.current.style.transform;
            const currentScaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
            const currentScaleValue = currentScaleMatch ? parseFloat(currentScaleMatch[1]) : 1;
            const newScale = currentScaleValue + (targetScale - currentScaleValue) * 0.2; // Smoothing
            visualizerRef.current.style.transform = `scale(${newScale})`;
        }

        animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
        cancelAnimationFrame(animationFrameId);
        source.disconnect();
        if (audioContext.state !== 'closed') {
            audioContext.close().catch(console.error);
        }
    };
  }, [isOpen, stream]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div className="text-center">
        <div 
            ref={visualizerRef}
            className="w-48 h-48 rounded-full bg-[--primary]/30 border-4 border-[--primary] flex items-center justify-center transition-transform duration-100 ease-linear"
            style={{ transform: 'scale(1)' }}
        >
             <MicrophoneIcon className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mt-8">Listening...</h2>
        <p className="text-lg text-slate-300 mt-2">Speak your story idea now</p>
      </div>

      <div className="absolute bottom-10">
        <Button onClick={onStop} size="lg" variant="danger">
          <StopCircleIcon className="w-6 h-6 mr-2" />
          Stop Recording
        </Button>
      </div>
    </div>
  );
};
