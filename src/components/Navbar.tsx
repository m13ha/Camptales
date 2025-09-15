import React from 'react';
import { Wand2, BookOpen, Users } from 'lucide-react';

type View = 'create' | 'stories' | 'characters';

interface NavbarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const navItems: { id: View; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'create', label: 'Create', icon: Wand2 },
  { id: 'stories', label: 'Saved Stories', icon: BookOpen },
  { id: 'characters', label: 'My Characters', icon: Users },
];

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full shadow-lg p-2 max-w-md mx-auto mb-8 sticky top-4 z-50">
      <ul className="flex items-center justify-around">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setCurrentView(item.id)}
              className={`
                flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300
                ${
                  currentView === item.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }
              `}
              aria-current={currentView === item.id ? 'page' : undefined}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};