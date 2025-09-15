import React from 'react';
import type { SettingsViewType } from '../App';
import { Card } from '../components/ui/Card';
import { Paintbrush, Type, Ear, Database, Info, ChevronRight } from 'lucide-react';

interface SettingsViewProps {
  onNavigate: (view: SettingsViewType) => void;
}

const settingsItems = [
  { 
    id: 'appearance', 
    label: 'Appearance', 
    description: 'Customize the look, feel, and layout of the app.',
    icon: Paintbrush 
  },
  { 
    id: 'typography', 
    label: 'Typography', 
    description: 'Adjust the font style and text size for readability.',
    icon: Type
  },
  { 
    id: 'reading', 
    label: 'Reading', 
    description: 'Change text-to-speech voice settings.',
    icon: Ear
  },
  { 
    id: 'data', 
    label: 'Data & History', 
    description: 'Manage how your story history is stored.',
    icon: Database
  },
  { 
    id: 'about', 
    label: 'About BedTales', 
    description: 'View app information and credits.',
    icon: Info
  },
];

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-4">
        {settingsItems.map(item => (
          <Card 
            key={item.id} 
            onClick={() => onNavigate(item.id as SettingsViewType)}
            className="flex items-center gap-4 !p-4"
          >
            <div className="bg-[--primary]/20 text-[--primary] p-3 rounded-lg">
                <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-[--text-primary]">{item.label}</h3>
              <p className="text-sm text-[--text-secondary]">{item.description}</p>
            </div>
            <ChevronRight className="w-6 h-6 text-[--text-secondary] flex-shrink-0" />
          </Card>
        ))}
      </div>
    </div>
  );
};