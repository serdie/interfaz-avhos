import { useAppStore } from '../store/app-store.js';
import { useTranslation, useTheme } from '@avhos/ui';
import { isTauriEnvironment } from '../services/fs-adapter-factory.js';

import type { FileTreeNode } from '@avhos/core';

/** Cuenta recursivamente los nodos del árbol de archivos. */
function countTreeNodes(nodes: FileTreeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count++;
    if (node.children) {
      count += countTreeNodes(node.children);
    }
  }
  return count;
}

/** Acorta una ruta para que quepa en la barra. */
function shortenPath(path: string, maxLen = 50): string {
  if (path.length <= maxLen) return path;
  const parts = path.split(/[\\/]/);
  if (parts.length <= 3) return path;
  return parts[0] + '/.../' + parts.slice(-2).join('/');
}

export function StatusBar() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const {
    workspaceRoot,
    openTabs,
    activeTabId,
    fileTree,
    treeLoading,
    treeError,
    toggleBottomPanel,
    toggleRightPanel,
    openPalette,
  } = useAppStore();

  const envLabel = isTauriEnvironment() ? 'Tauri' : 'Dev';
  const adapterLabel = isTauriEnvironment() ? 'TauriFsAdapter' : 'ViteDevFsAdapter';
  const activeTab = openTabs.find((tab) => tab.id === activeTabId);
  const fileCount = countTreeNodes(fileTree);
  const dirtyCount = openTabs.filter((tab) => tab.isDirty).length;

  return (
    <div
      style={{
        height: '26px',
        minHeight: '26px',
        background: theme.colors.accent,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontSize: 'var(--font-xs)',
        gap: '12px',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Sección izquierda: paleta + proyecto */}
      <span style={{ cursor: 'pointer', opacity: 0.9 }} onClick={openPalette}>
        ⌘ {t('commandPalette.title')}
      </span>

      {workspaceRoot ? (
        <span title={workspaceRoot} style={{ opacity: 0.95 }}>
          📂 {shortenPath(workspaceRoot)}
        </span>
      ) : (
        <span style={{ opacity: 0.6 }}>Sin proyecto</span>
      )}

      {/* Entorno y adaptador */}
      <span style={{ opacity: 0.85 }}>
        {envLabel} · {adapterLabel}
      </span>

      {/* Estado del árbol */}
      {treeLoading && <span style={{ opacity: 0.8 }}>⟳ Cargando...</span>}
      {treeError && <span style={{ opacity: 0.9, color: '#ffd0d0' }}>⚠ Error en árbol</span>}
      {fileTree.length > 0 && !treeError && (
        <span style={{ opacity: 0.75 }}>{fileCount} elementos</span>
      )}

      {/* Pestañas */}
      {openTabs.length > 0 && (
        <span style={{ opacity: 0.75 }}>
          {openTabs.length} pestaña{openTabs.length !== 1 ? 's' : ''}
          {dirtyCount > 0 && (
            <span style={{ marginLeft: '4px', color: '#ffe0a0' }}>
              · {dirtyCount} sin guardar
            </span>
          )}
        </span>
      )}

      {/* Spacer */}
      <span style={{ flex: 1 }} />

      {/* Sección derecha: archivo activo + paneles + versión */}
      {activeTab && (
        <span style={{ opacity: 0.85 }}>
          {activeTab.filePath.split(/[\\/]/).pop() ?? activeTab.filePath}
          {activeTab.isDirty && <span style={{ color: '#ffe0a0' }}> ●</span>}
        </span>
      )}

      <span
        style={{ cursor: 'pointer', opacity: 0.8 }}
        onClick={toggleBottomPanel}
      >
        {t('activity.title')}
      </span>
      <span
        style={{ cursor: 'pointer', opacity: 0.8 }}
        onClick={toggleRightPanel}
      >
        {t('rightPanel.title')}
      </span>
      <span style={{ opacity: 0.6 }}>es-ES</span>
      <span style={{ opacity: 0.6 }}>AVHOS v0.1.0</span>
    </div>
  );
}
