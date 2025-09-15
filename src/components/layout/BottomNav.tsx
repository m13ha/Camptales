import React from 'react';
import { Wand2, BookOpen, Users, Settings, History } from 'lucide-react';

type View = 'create' | 'stories' | 'history' | 'characters' | 'settings';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const navItems: { id: View; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'create', label: 'Create', icon: Wand2 },
  { id: 'stories', label: 'Stories', icon: BookOpen },
  { id: 'history', label: 'History', icon: History },
  { id: 'characters', label: 'Characters', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
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