import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { fonts, fontSizes } from '../../themes';
import { Select } from '../../components/ui/Select';

export const TypographySettingsView: React.FC = () => {
    const { fontStyle, setFontStyle, fontSize, setFontSize } = useSettings();

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <Select
                id="font-style"
                label="Font Style"
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value as keyof typeof fonts)}
            >
                {Object.keys(fonts).map(fontName => (
                    <option key={fontName} value={fontName}>{fontName}</option>
                ))}
            </Select>
            <Select
                id="font-size"
                label="Text Size"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as keyof typeof fontSizes)}
            >
                {Object.keys(fontSizes).map(sizeName => (
                    <option key={sizeName} value={sizeName}>{sizeName}</option>
                ))}
            </Select>
        </div>
    );
};