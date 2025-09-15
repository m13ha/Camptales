import React, { useState, useRef } from 'react';
import { useSettings, HistoryRetentionPeriod } from '../../contexts/SettingsContext';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Download, Upload } from 'lucide-react';


const retentionOptions: { value: HistoryRetentionPeriod, label: string }[] = [
    { value: '3d', label: '3 days' },
    { value: '7d', label: '1 week' },
    { value: '30d', label: '1 month' },
    { value: 'never', label: 'Never' },
];

interface DataSettingsViewProps {
    onClearHistory: () => Promise<void>;
    onClearStories: () => Promise<void>;
    onClearCharacters: () => Promise<void>;
    onExport: () => void;
    onImport: (data: any) => Promise<void>;
    onError: (message: string | Error) => void;
}

export const DataSettingsView: React.FC<DataSettingsViewProps> = ({ onClearHistory, onClearStories, onClearCharacters, onExport, onImport, onError }) => {
    const { historyRetention, setHistoryRetention } = useSettings();
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'primary';
        confirmText?: string;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClearRequest = (clearFunction: () => Promise<void>, type: string, description: string) => {
        setModalState({
            isOpen: true,
            title: `Confirm Deletion`,
            message: `Are you sure you want to permanently delete all your ${type}?\n\n${description}`,
            onConfirm: () => {
                clearFunction().catch(err => {
                    console.error(`Failed to clear ${type}`, err);
                    onError(`An error occurred while clearing your ${type}. Please try again.`);
                });
                setModalState(null);
            },
            variant: 'danger',
            confirmText: 'Delete',
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Failed to read file.");
                
                const data = JSON.parse(text);
                if (typeof data !== 'object' || data === null || !data.stories || !data.characters) {
                    throw new Error("This does not appear to be a valid BedTales backup file.");
                }

                const storyCount = data.stories?.length || 0;
                const charCount = data.characters?.length || 0;
                const historyCount = data.history?.length || 0;

                setModalState({
                    isOpen: true,
                    title: "Confirm Restore",
                    message: `Restore from a backup containing:\n\n- ${storyCount} Stories\n- ${charCount} Characters\n- ${historyCount} History Items\n\nThis will add or overwrite existing data. Continue?`,
                    onConfirm: () => {
                        onImport(data);
                        setModalState(null);
                    },
                    variant: 'primary',
                    confirmText: 'Restore',
                });
            } catch (error) {
                onError(error instanceof Error ? error.message : "Failed to parse backup file.");
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };
        reader.readAsText(file);
    };
    
    const handleCloseModal = () => {
        setModalState(null);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {modalState && (
                <ConfirmationModal
                    isOpen={modalState.isOpen}
                    onClose={handleCloseModal}
                    onConfirm={modalState.onConfirm}
                    title={modalState.title}
                    message={modalState.message}
                    confirmText={modalState.confirmText}
                    variant={modalState.variant}
                />
            )}
            <div>
                <Select
                    id="history-retention"
                    label="Automatically delete stories from history after"
                    value={historyRetention}
                    onChange={(e) => setHistoryRetention(e.target.value as HistoryRetentionPeriod)}
                >
                    {retentionOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </Select>
            </div>

            <Card>
                <h3 className="text-xl font-bold mb-2">Backup & Restore</h3>
                <p className="text-[--text-secondary] mt-1 mb-4">Save your stories, characters, and settings to a file, or restore from a backup.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={onExport} className="w-full">
                        <Upload className="w-5 h-5 mr-2" />
                        Create Backup
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                         <Download className="w-5 h-5 mr-2" />
                        Restore from File
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json,application/json"
                        className="hidden"
                    />
                </div>
            </Card>

            <Card className="border-[--danger]/50">
                <h3 className="text-xl font-bold text-[--danger]">Danger Zone</h3>
                <p className="text-[--text-secondary] mt-1 mb-4">These actions are permanent and cannot be undone.</p>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-[--input-background] p-3 rounded-lg">
                        <div>
                            <p className="font-semibold text-[--text-primary]">Clear Reading History</p>
                            <p className="text-sm text-[--text-secondary]">Permanently delete all read stories.</p>
                        </div>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleClearRequest(onClearHistory, 'reading history', 'This will not affect your saved stories.')}
                        >
                            Clear
                        </Button>
                    </div>

                    <div className="flex justify-between items-center bg-[--input-background] p-3 rounded-lg">
                        <div>
                            <p className="font-semibold text-[--text-primary]">Clear Saved Stories</p>
                            <p className="text-sm text-[--text-secondary]">Permanently delete your entire library.</p>
                        </div>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleClearRequest(onClearStories, 'saved stories', 'This action cannot be undone.')}
                        >
                            Clear
                        </Button>
                    </div>

                    <div className="flex justify-between items-center bg-[--input-background] p-3 rounded-lg">
                        <div>
                            <p className="font-semibold text-[--text-primary]">Clear Saved Characters</p>
                            <p className="text-sm text-[--text-secondary]">Permanently delete all created characters.</p>
                        </div>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleClearRequest(onClearCharacters, 'saved characters', 'This will not affect character descriptions in saved stories.')}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};