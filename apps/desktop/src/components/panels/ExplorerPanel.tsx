import { useState, useCallback } from 'react';
import { useAppStore, createFileTab } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, EmptyState, ScrollList, IconButton } from '@avhos/ui';
import type { FileTreeNode } from '@avhos/core';
import { getWorkspaceService, setWorkspaceService } from '../../services/service-registry.js';
import { selectNewProject } from '../../services/fs-adapter-factory.js';
import { WorkspaceService } from '../../services/workspace-service.js';
import { modelManager } from '../../services/monaco-model-manager.js';

const FOLDER_ICON = 'M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z';
const FOLDER_OPEN_ICON = 'M19 20H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h5l2 2h8c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2z';
const FILE_ICON = 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z';

const EXTENSION_LANGUAGES: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  json: 'json',
  css: 'css',
  html: 'html',
  md: 'markdown',
  rs: 'rust',
  toml: 'toml',
  yaml: 'yaml',
  yml: 'yaml',
};

export function ExplorerPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const {
    fileTree,
    treeLoading,
    treeError,
    workspaceRoot,
    openTab,
    setFileTree,
    setTreeLoading,
    setTreeError,
    updateNode,
  } = useAppStore();

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const handleRefresh = useCallback(async () => {
    const ws = getWorkspaceService();
    if (!workspaceRoot) return;
    setTreeLoading(true);
    setTreeError(null);
    try {
      const nodes = await ws.loadRoot(workspaceRoot);
      setFileTree(nodes);
      useAppStore.getState().pushActivity('explorer', 'info', `Árbol refrescado: ${nodes.length} elementos en raíz`);
    } catch (err) {
      setTreeError(err instanceof Error ? err.message : 'Error al cargar el directorio');
      useAppStore.getState().pushActivity('explorer', 'error', `Error al refrescar árbol: ${err instanceof Error ? err.message : 'desconocido'}`);
    } finally {
      setTreeLoading(false);
    }
  }, [workspaceRoot, setFileTree, setTreeLoading, setTreeError]);

  const handleOpenProject = useCallback(async () => {
    // Comprobar si hay pestañas con cambios sin guardar
    const { openTabs, closeAllTabs } = useAppStore.getState();
    const dirtyTabs = openTabs.filter((t) => t.isDirty);
    if (dirtyTabs.length > 0) {
      const names = dirtyTabs.map((t) => t.filePath.split('/').pop() ?? t.filePath).join(', ');
      const confirmed = window.confirm(
        `Hay cambios sin guardar en: ${names}.\n\n¿Cambiar de proyecto de todos modos? Los cambios se perderán.`,
      );
      if (!confirmed) return;
    }

    // Limpiar todos los modelos de Monaco
    modelManager.disposeAll();

    // Cerrar todas las pestañas y resetear estado
    closeAllTabs();

    // Seleccionar nuevo directorio
    const newAdapter = await selectNewProject();
    if (!newAdapter) return; // usuario canceló

    // Crear nuevo WorkspaceService
    const wsService = new WorkspaceService(newAdapter);
    setWorkspaceService(wsService);

    const newRoot = await newAdapter.getRootPath();
    useAppStore.getState().setWorkspaceRoot(newRoot);
    useAppStore.getState().pushActivity('workspace', 'info', `Proyecto abierto: ${newRoot}`);

    // Cargar árbol de archivos
    setTreeLoading(true);
    setTreeError(null);
    try {
      const nodes = await wsService.loadRoot(newRoot);
      setFileTree(nodes);
      useAppStore.getState().pushActivity('workspace', 'info', `Árbol cargado: ${nodes.length} elementos en raíz`);
    } catch (err) {
      setTreeError(err instanceof Error ? err.message : 'Error al cargar el directorio');
      useAppStore.getState().pushActivity('workspace', 'error', `Error al cargar árbol: ${err instanceof Error ? err.message : 'desconocido'}`);
    } finally {
      setTreeLoading(false);
    }
  }, [setFileTree, setTreeLoading, setTreeError]);

  const handleToggleDir = useCallback(async (node: FileTreeNode) => {
    const ws = getWorkspaceService();
    if (!workspaceRoot) return;

    const isExpanded = expandedPaths.has(node.path);
    const newExpanded = new Set(expandedPaths);

    if (isExpanded) {
      newExpanded.delete(node.path);
      setExpandedPaths(newExpanded);
      updateNode(node.path, (n) => ({ ...n, expanded: false }));
    } else {
      newExpanded.add(node.path);
      setExpandedPaths(newExpanded);

      if (!node.loaded) {
        updateNode(node.path, (n) => ({ ...n, expanded: true }));
        try {
          const children = await ws.loadDirectory(node.absolutePath, workspaceRoot);
          updateNode(node.path, (n) => ({
            ...n,
            children,
            loaded: true,
            expanded: true,
            error: null,
          }));
        } catch (err) {
          updateNode(node.path, (n) => ({
            ...n,
            loaded: true,
            expanded: true,
            error: err instanceof Error ? err.message : 'Failed to load',
          }));
        }
      } else {
        updateNode(node.path, (n) => ({ ...n, expanded: true }));
      }
    }
  }, [expandedPaths, workspaceRoot, updateNode]);

  const handleOpenFile = (node: FileTreeNode) => {
    if (!workspaceRoot) return;
    const lang = EXTENSION_LANGUAGES[node.extension ?? ''] ?? 'plaintext';
    openTab(createFileTab(workspaceRoot as unknown as import('@avhos/core').UUID, node.path, lang));
    useAppStore.getState().pushActivity('explorer', 'info', `Archivo abierto: ${node.name}`);
  };

  return (
    <Panel>
      <PanelHeader
        title={t('explorer.title')}
        actions={
          <>
            <IconButton title="Abrir proyecto" onClick={handleOpenProject}>📂</IconButton>
            <IconButton title={t('explorer.refresh')} onClick={handleRefresh}>↻</IconButton>
            <IconButton title={t('explorer.newFile')}>+</IconButton>
          </>
        }
      />
      {treeLoading && fileTree.length === 0 ? (
        <div style={{ padding: '16px', color: theme.colors.textMuted, fontSize: 'var(--font-sm)' }}>
          {t('common.loading')}
        </div>
      ) : treeError ? (
        <div style={{ padding: '16px', color: theme.colors.danger, fontSize: 'var(--font-sm)' }}>
          {treeError}
        </div>
      ) : fileTree.length === 0 ? (
        <EmptyState message={t('explorer.empty')} />
      ) : (
        <ScrollList>
          {fileTree.map((node) => (
            <TreeRow
              key={node.id}
              node={node}
              depth={0}
              expandedPaths={expandedPaths}
              onToggleDir={handleToggleDir}
              onOpenFile={handleOpenFile}
              theme={theme}
            />
          ))}
        </ScrollList>
      )}
    </Panel>
  );
}

function TreeRow({
  node,
  depth,
  expandedPaths,
  onToggleDir,
  onOpenFile,
  theme,
}: {
  node: FileTreeNode;
  depth: number;
  expandedPaths: Set<string>;
  onToggleDir: (node: FileTreeNode) => void;
  onOpenFile: (node: FileTreeNode) => void;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const isDir = node.type === 'directory';
  const isExpanded = expandedPaths.has(node.path);
  const paddingLeft = 8 + depth * 16;

  return (
    <>
      <div
        onClick={() => (isDir ? onToggleDir(node) : onOpenFile(node))}
        style={{
          padding: `4px ${paddingLeft}px 4px ${paddingLeft}px`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: 'var(--font-sm)',
          color: isDir ? theme.colors.textPrimary : theme.colors.textSecondary,
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.colors.bgHover; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        {isDir ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, color: theme.colors.accent }}>
            <path d={isExpanded ? FOLDER_OPEN_ICON : FOLDER_ICON} />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, color: theme.colors.textMuted }}>
            <path d={FILE_ICON} />
          </svg>
        )}
        <span>{node.name}</span>
        {node.error && (
          <span style={{ color: theme.colors.danger, fontSize: 'var(--font-xs)', marginLeft: '4px' }}>
            !
          </span>
        )}
      </div>
      {isDir && isExpanded && node.children && (
        <>
          {node.children.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              onToggleDir={onToggleDir}
              onOpenFile={onOpenFile}
              theme={theme}
            />
          ))}
          {node.children.length === 0 && (
            <div style={{
              padding: `4px ${paddingLeft + 20}px`,
              color: theme.colors.textMuted,
              fontSize: 'var(--font-xs)',
              fontStyle: 'italic',
            }}>
              (vacío)
            </div>
          )}
        </>
      )}
    </>
  );
}
