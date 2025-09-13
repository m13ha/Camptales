import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Topbar } from './Topbar';

type View = 'create' | 'stories' | 'characters' | 'settings' | 'reader' | 'history';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
}

const viewTitles: Record<View, string> = {
    create: 'Create Story',
    stories: 'Library',
    history: 'History',
    characters: 'Characters',
    settings: 'Settings',
    reader: 'reader',
};


export const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView }) => {
  const { theme } = useSettings();
  const showNav = currentView !== 'reader';

  return (
    <div 
      style={{ 
        fontFamily: 'var(--font-family)',
        fontSize: 'var(--font-size-base)',
        backgroundColor: 'var(--background)',
        color: 'var(--text-primary)' 
      }}
      className="min-h-screen transition-colors duration-300"
    >
      <div className="flex w-full min-h-screen">
        {/* Sidebar for medium screens and up */}
        {showNav && <Sidebar currentView={currentView} setCurrentView={setCurrentView} />}
        
        {/* Main Content Column */}
        <div className="flex flex-1 flex-col h-screen">
            {showNav && <Topbar title={viewTitles[currentView]} />}

            {/* Scrollable content */}
            <main className="flex-1 overflow-y-auto">
              <div className={`max-w-5xl mx-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8`}>
                {children}
              </div>
            </main>
        </div>
      </div>
      
      {/* Bottom Nav for small screens, fixed to viewport */}
      {showNav && <BottomNav currentView={currentView} setCurrentView={setCurrentView} />}
    </div>
  );
};