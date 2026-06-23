import { useEffect } from 'react';
import { useAppStore } from '../store/app-store.js';
import { ActivityBar } from './ActivityBar.js';
import { Sidebar } from './Sidebar.js';
import { EditorArea } from './EditorArea.js';
import { BottomPanel } from './BottomPanel.js';
import { RightPanel } from './RightPanel.js';
import { CommandPalette } from './CommandPalette.js';
import { StatusBar } from './StatusBar.js';

export function IDELayout() {
  const { openPalette, toggleSidebar, toggleBottomPanel, toggleRightPanel } = useAppStore();

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+P — Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        openPalette();
      }
      // Ctrl+B — Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      // Ctrl+J — Toggle bottom panel
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        toggleBottomPanel();
      }
      // Ctrl+L — Toggle right panel
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        toggleRightPanel();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openPalette, toggleSidebar, toggleBottomPanel, toggleRightPanel]);

  return (
    <>
      {/* Main layout: activity bar | sidebar | editor+bottom | right panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ActivityBar />
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <EditorArea />
          <BottomPanel />
        </div>
        <RightPanel />
      </div>
      {/* Status bar at the bottom */}
      <StatusBar />
      {/* Command palette overlay */}
      <CommandPalette />
    </>
  );
}
