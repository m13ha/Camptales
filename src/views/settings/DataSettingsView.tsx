import React from 'react';
import { useSettings, HistoryRetentionPeriod } from '../../contexts/SettingsContext';
import { Select } from '../../components/ui/Select';

const retentionOptions: { value: HistoryRetentionPeriod, label: string }[] = [
    { value: '3d', label: '3 days' },
    { value: '7d', label: '1 week' },
    { value: '30d', label: '1 month' },
    { value: 'never', label: 'Never' },
];

export const DataSettingsView: React.FC = () => {
    const { historyRetention, setHistoryRetention } = useSettings();

    return (
        <div className="max-w-3xl mx-auto">
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
    );
};