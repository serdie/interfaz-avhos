import { useEffect, useState } from 'react';
import { I18nProvider, ThemeProvider, useThemeStyles } from '@avhos/ui';
import { useAppStore } from './store/app-store.js';
import { initServices } from './services/container.js';
import { injectGlobalCSS } from './styles/global.css.js';
import { WorkspaceService } from './services/workspace-service.js';
import { setWorkspaceService } from './services/service-registry.js';
import { createFsAdapter } from './services/fs-adapter-factory.js';
import { detectOllama } from './services/ollama-service.js';
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

        // Load real project inventory (recursive scan)
        store.getState().setInventoryLoading(true);
        wsService.loadFileInventory(rootPath)
          .then((files) => {
            store.getState().setProjectInventory(files);
            store.getState().setInventoryLoading(false);
            store.getState().pushActivity('workspace', 'info', `Inventario del proyecto: ${files.length} archivos`);
          })
          .catch(() => {
            store.getState().setInventoryLoading(false);
          });
      } catch (err) {
        store.getState().setTreeError(err instanceof Error ? err.message : 'Failed to init filesystem');
        store.getState().setTreeLoading(false);
        store.getState().pushActivity('workspace', 'error', `Error al abrir proyecto: ${err instanceof Error ? err.message : 'desconocido'}`);
      }

      // Detect Ollama and list real models
      detectOllama();

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
