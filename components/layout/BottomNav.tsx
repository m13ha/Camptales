import React from 'react';
import { CreatorIcon } from '../icons/CreatorIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { HistoryIcon } from '../icons/HistoryIcon';

type View = 'create' | 'stories' | 'history' | 'characters' | 'settings';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const navItems: { id: View; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'create', label: 'Create', icon: CreatorIcon },
  { id: 'stories', label: 'Stories', icon: BookOpenIcon },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'characters', label: 'Characters', icon: UsersIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[--background] border-t border-[--border] z-50 md:hidden">
      <ul className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <li key={item.id} className="flex-1">
            <button
              onClick={() => setCurrentView(item.id)}
              className={`
                w-full h-full flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-200
                ${
                  currentView === item.id
                    ? 'text-[--primary]'
                    : 'text-[--text-secondary] hover:text-[--text-primary]'
                }
              `}
              aria-current={currentView === item.id ? 'page' : undefined}
            >
              <item.icon className="w-6 h-6" />
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};