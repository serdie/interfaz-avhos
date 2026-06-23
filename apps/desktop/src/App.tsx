import { useEffect, useState } from 'react';
import { I18nProvider, ThemeProvider, useThemeStyles } from '@avhos/ui';
import { useAppStore } from './store/app-store.js';
import { initServices } from './services/container.js';
import { injectGlobalCSS } from './styles/global.css.js';
import { WorkspaceService } from './services/workspace-service.js';
import { setWorkspaceService } from './services/service-registry.js';
import { createFsAdapter } from './services/fs-adapter-factory.js';
import {
  createSeedWorkspace,
  createSeedTasks,
  createSeedMemory,
  createSeedSkills,
  createSeedMcpServers,
  createSeedProviders,
  createSeedProfiles,
  createSeedSettings,
} from './data/seed.js';
import { IDELayout } from './components/IDELayout.js';

function AppInner() {
  const { style, theme } = useThemeStyles();
  const [ready, setReady] = useState(false);
  const store = useAppStore;

  useEffect(() => {
    injectGlobalCSS();
    initServices().then(async () => {
      // Initialize real filesystem-backed workspace explorer
      try {
        const fsAdapter = await createFsAdapter();
        const wsService = new WorkspaceService(fsAdapter);
        setWorkspaceService(wsService);

        const rootPath = await fsAdapter.getRootPath();
        store.getState().setWorkspaceRoot(rootPath);
        store.getState().pushActivity('workspace', 'info', `Proyecto abierto: ${rootPath}`);

        // Load real root directory
        store.getState().setTreeLoading(true);
        const rootNodes = await wsService.loadRoot(rootPath);
        store.getState().setFileTree(rootNodes);
        store.getState().setTreeLoading(false);
        store.getState().pushActivity('workspace', 'info', `Árbol cargado: ${rootNodes.length} elementos en raíz`);
      } catch (err) {
        store.getState().setTreeError(err instanceof Error ? err.message : 'Failed to init filesystem');
        store.getState().setTreeLoading(false);
        store.getState().pushActivity('workspace', 'error', `Error al abrir proyecto: ${err instanceof Error ? err.message : 'desconocido'}`);
      }

      // Load seed data for non-explorer panels (still mock-backed)
      const ws = createSeedWorkspace();
      store.getState().setWorkspace(ws);
      store.getState().setTasks(createSeedTasks());
      store.getState().setMemoryEntries(createSeedMemory(ws.id));
      store.getState().setSkills(createSeedSkills());
      store.getState().setMcpServers(createSeedMcpServers());
      store.getState().setProviders(createSeedProviders());
      store.getState().setProfiles(createSeedProfiles());
      store.getState().setSettings(createSeedSettings());

      // Set default profile
      const profiles = createSeedProfiles();
      const defaultProfile = profiles.find((p) => p.isDefault);
      if (defaultProfile) store.getState().setActiveProfile(defaultProfile.id);

      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: theme.colors.bgPrimary,
          color: theme.colors.textMuted,
          fontSize: theme.fontSizes.lg,
        }}
      >
        Inicializando AVHOS...
      </div>
    );
  }

  return (
    <div style={{ ...style, height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <IDELayout />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppInner />
      </I18nProvider>
    </ThemeProvider>
  );
}
