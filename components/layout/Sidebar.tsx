import React from 'react';
import { CreatorIcon } from '../icons/CreatorIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { HistoryIcon } from '../icons/HistoryIcon';
import { Logo } from '../Logo';

type View = 'create' | 'stories' | 'history' | 'characters' | 'settings';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const navItems: { id: View; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'create', label: 'Create', icon: CreatorIcon },
  { id: 'stories', label: 'Saved Stories', icon: BookOpenIcon },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'characters', label: 'Characters', icon: UsersIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <aside className="hidden md:flex flex-col flex-shrink-0 items-center lg:items-stretch sticky top-0 h-screen bg-[--card-background] border-r border-[--border] backdrop-blur-lg transition-all duration-300 w-20 lg:w-64 p-4">
      <div className="mb-8 hidden lg:block">
        <Logo />
      </div>
      <div className="mb-8 lg:hidden">
          <div className="w-10 h-10 bg-[--primary] rounded-full" />
      </div>
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.id)}
                className={`
                  w-full flex items-center gap-4 px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200
                  ${
                    currentView === item.id
                      ? 'bg-[--primary] text-[--primary-text] shadow-md'
                      : 'text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/10'
                  }
                  justify-center lg:justify-start
                `}
                aria-current={currentView === item.id ? 'page' : undefined}
                title={item.label}
              >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};