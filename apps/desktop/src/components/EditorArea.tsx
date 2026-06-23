import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/app-store.js';
import { useTranslation, useTheme, EmptyState } from '@avhos/ui';
import { Editor, type OnMount } from '@monaco-editor/react';
import { getWorkspaceService } from '../services/service-registry.js';
import { modelManager } from '../services/monaco-model-manager.js';

/** Extensiones consideradas binarias (no se muestran en el editor). */
const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'svg',
  'pdf', 'zip', 'gz', 'tar', 'rar', '7z',
  'exe', 'dll', 'so', 'dylib', 'wasm',
  'mp3', 'mp4', 'wav', 'avi', 'mov', 'webm',
  'ttf', 'otf', 'woff', 'woff2', 'eot',
  'lock', 'bin', 'dat', 'db', 'sqlite',
]);

/** Detecta si un contenido es binario (presencia de bytes nulos o muchos no imprimibles). */
function isBinaryContent(content: string): boolean {
  if (content.length === 0) return false;
  const sample = content.slice(0, 8000);
  let nonPrintable = 0;
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if (code === 0) return true;
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) nonPrintable++;
  }
  return nonPrintable / sample.length > 0.3;
}

export function EditorArea() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const {
    openTabs, activeTabId, setActiveTab, closeTab,
    tabContents, setTabContent, markTabDirty, markTabClean,
    workspaceRoot,
  } = useAppStore();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const previousTabIdRef = useRef<string | null>(null);
  const saveHandlerRef = useRef<(() => void) | null>(null);

  const activeTab = openTabs.find((tab) => tab.id === activeTabId);
  const tabContent = activeTab ? tabContents[activeTab.id] : undefined;

  // Cargar contenido real del archivo cuando la pestaña activa cambia
  useEffect(() => {
    if (!activeTab || !workspaceRoot) return;

    // Si ya está cargado (o cargando), no recargar
    if (tabContents[activeTab.id]?.loaded || tabContents[activeTab.id]?.loading) return;

    const ext = activeTab.filePath.split('.').pop()?.toLowerCase() ?? ''

    // Archivos binarios: no intentar leer
    if (BINARY_EXTENSIONS.has(ext)) {
      setTabContent(activeTab.id, {
        content: '',
        loading: false,
        error: `Archivo binario (.${ext}) — no se puede mostrar como texto.`,
        loaded: true,
        saving: false,
        saveError: null,
      });
      return;
    }

    setTabContent(activeTab.id, { content: '', loading: true, error: null, loaded: false, saving: false, saveError: null });

    const fullPath = `${workspaceRoot}/${activeTab.filePath}`.replace(/\\/g, '/');

    getWorkspaceService()
      .loadFileContent(fullPath)
      .then((result) => {
        if (result.error) {
          setTabContent(activeTab.id, {
            content: '',
            loading: false,
            error: result.error,
            loaded: true,
            saving: false,
            saveError: null,
          });
          useAppStore.getState().pushActivity('editor', 'error', `Error al leer «${activeTab.filePath.split('/').pop()}»: ${result.error}`);
          return;
        }
        if (isBinaryContent(result.content)) {
          setTabContent(activeTab.id, {
            content: '',
            loading: false,
            error: 'El archivo parece ser binario — no se puede mostrar como texto.',
            loaded: true,
            saving: false,
            saveError: null,
          });
          useAppStore.getState().pushActivity('editor', 'warn', `Archivo binario, no editable: ${activeTab.filePath.split('/').pop()}`);
          return;
        }
        setTabContent(activeTab.id, {
          content: result.content,
          loading: false,
          error: null,
          loaded: true,
          saving: false,
          saveError: null,
        });
      })
      .catch((err) => {
        setTabContent(activeTab.id, {
          content: '',
          loading: false,
          error: err instanceof Error ? err.message : 'Error desconocido al leer el archivo',
          loaded: true,
          saving: false,
          saveError: null,
        });
        useAppStore.getState().pushActivity('editor', 'error', `Error al leer «${activeTab.filePath.split('/').pop()}»: ${err instanceof Error ? err.message : 'desconocido'}`);
      });
  }, [activeTab, workspaceRoot, tabContents, setTabContent]);

  // Gestionar modelos Monaco: crear/intercambiar al cambiar de pestaña
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !activeTab) return;

    // Guardar viewState de la pestaña anterior
    if (previousTabIdRef.current) {
      const prevTab = openTabs.find((t) => t.id === previousTabIdRef.current);
      if (prevTab) {
        modelManager.saveViewState(prevTab.filePath, editor);
      }
    }

    // Si hay error o está cargando, no asignar modelo
    if (tabContent?.error || tabContent?.loading || !tabContent?.loaded) {
      previousTabIdRef.current = activeTab.id;
      return;
    }

    // Obtener o crear el modelo para esta ruta
    const model = modelManager.getOrCreateModel(
      activeTab.filePath,
      activeTab.language,
      tabContent.content,
    );

    // Intercambiar modelo en el editor (instantáneo, preserva undo/redo del modelo)
    if (editor.getModel() !== model) {
      editor.setModel(model);
    }

    // Restaurar viewState (cursor, scroll) si existe
    modelManager.restoreViewState(activeTab.filePath, editor);

    previousTabIdRef.current = activeTab.id;
  }, [activeTab, tabContent, openTabs]);

  // Guardar archivo activo a disco
  const handleSave = useCallback(async () => {
    if (!activeTab || !workspaceRoot) return;
    const content = modelManager.getModelValue(activeTab.filePath);
    if (content === null) return;

    // Marcar como guardando
    setTabContent(activeTab.id, {
      ...tabContents[activeTab.id]!,
      saving: true,
      saveError: null,
    });

    const fullPath = `${workspaceRoot}/${activeTab.filePath}`.replace(/\\/g, '/');
    const result = await getWorkspaceService().saveFileContent(fullPath, content);

    if (result.error) {
      setTabContent(activeTab.id, {
        ...tabContents[activeTab.id]!,
        saving: false,
        saveError: result.error,
      });
      useAppStore.getState().pushActivity('editor', 'error', `Error al guardar «${activeTab.filePath.split('/').pop()}»: ${result.error}`);
    } else {
      // Guardado exitoso: limpiar sucio y actualizar contenido original
      modelManager.markClean(activeTab.filePath);
      markTabClean(activeTab.id);
      setTabContent(activeTab.id, {
        ...tabContents[activeTab.id]!,
        saving: false,
        saveError: null,
      });
      useAppStore.getState().pushActivity('editor', 'info', `Archivo guardado: ${activeTab.filePath.split('/').pop()}`);
    }
  }, [activeTab, workspaceRoot, tabContents, setTabContent, markTabClean]);

  // Mantener la ref del handler de guardado actualizada
  useEffect(() => {
    saveHandlerRef.current = handleSave;
  }, [handleSave]);

  // Cerrar pestaña con confirmación si hay cambios sin guardar
  const handleCloseTab = useCallback((tabId: string) => {
    const tab = openTabs.find((t) => t.id === tabId);
    if (!tab) return;

    // Si la pestaña tiene cambios sin guardar, pedir confirmación
    if (tab.isDirty) {
      const fileName = tab.filePath.split('/').pop() ?? tab.filePath;
      const confirmed = window.confirm(
        `«${fileName}» tiene cambios sin guardar.\n\n¿Quieres cerrarlo de todos modos? Los cambios se perderán.`,
      );
      if (!confirmed) {
        useAppStore.getState().pushActivity('editor', 'warn', `Cierre cancelado: «${fileName}» tiene cambios sin guardar`);
        return;
      }
      useAppStore.getState().pushActivity('editor', 'warn', `Pestaña cerrada con cambios sin guardar: ${fileName}`);
    } else {
      useAppStore.getState().pushActivity('editor', 'info', `Pestaña cerrada: ${tab.filePath.split('/').pop() ?? tab.filePath}`);
    }

    modelManager.disposeModel(tab.filePath);
    closeTab(tabId as Parameters<typeof closeTab>[0]);
  }, [openTabs, closeTab]);

  // Aviso al salir/recargar si hay pestañas sucias
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const hasDirty = useAppStore.getState().openTabs.some((t) => t.isDirty);
      if (hasDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    modelManager.init(monaco);

    monaco.editor.defineTheme('avhos-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': theme.colors.bgPrimary,
        'editor.foreground': theme.colors.textPrimary,
        'editorLineNumber.foreground': theme.colors.textMuted,
        'editor.lineHighlightBackground': theme.colors.bgHover,
        'editor.selectionBackground': theme.colors.accent + '33',
        'editorCursor.foreground': theme.colors.accent,
      },
    });
    monaco.editor.setTheme('avhos-dark');

    // Detectar cambios de contenido y marcar pestaña como sucia
    editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      if (!model) return;
      // Buscar la pestaña correspondiente a este modelo por su URI
      const activeTabNow = useAppStore.getState().openTabs.find(
        (t) => t.id === useAppStore.getState().activeTabId,
      );
      if (activeTabNow && modelManager.isDirty(activeTabNow.filePath)) {
        markTabDirty(activeTabNow.id);
      } else if (activeTabNow) {
        markTabClean(activeTabNow.id);
      }
    });

    // Ctrl+S para guardar
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveHandlerRef.current?.();
    });
  };

  if (!activeTab) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.colors.bgPrimary,
        }}
      >
        <EmptyState message={t('editor.empty')} hint={t('editor.empty.hint')} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: theme.colors.bgPrimary }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          background: theme.colors.bgSecondary,
          borderBottom: `1px solid ${theme.colors.border}`,
          overflowX: 'auto',
        }}
      >
        {openTabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              background: tab.id === activeTabId ? theme.colors.bgPrimary : 'transparent',
              borderRight: `1px solid ${theme.colors.border}`,
              borderBottom: tab.id === activeTabId ? `1px solid ${theme.colors.bgPrimary}` : 'none',
              color: tab.id === activeTabId ? theme.colors.textPrimary : theme.colors.textSecondary,
              fontSize: 'var(--font-sm)',
              whiteSpace: 'nowrap',
              position: 'relative',
            }}
          >
            {tab.filePath.split('/').pop()}
            {tab.isDirty && <span style={{ color: theme.colors.warning }}>●</span>}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseTab(tab.id);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.textMuted,
                cursor: 'pointer',
                fontSize: 'var(--font-base)',
                padding: '0',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Monaco editor + estados de carga/error/guardado */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {tabContent?.loading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: theme.colors.bgPrimary, color: theme.colors.textMuted,
            fontSize: 'var(--font-base)', zIndex: 10,
          }}>
            Cargando archivo...
          </div>
        )}
        {tabContent?.error && !tabContent.loading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: theme.colors.bgPrimary, color: theme.colors.danger,
            fontSize: 'var(--font-base)', zIndex: 10, padding: '24px', textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>No se pudo abrir el archivo</p>
            <p style={{ margin: 0, fontSize: 'var(--font-sm)', color: theme.colors.textMuted }}>
              {tabContent.error}
            </p>
          </div>
        )}
        {tabContent?.saving && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: theme.colors.accent, zIndex: 20,
          }} />
        )}
        {tabContent?.saveError && !tabContent.saving && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '8px 16px',
            background: theme.colors.danger, color: '#fff',
            fontSize: 'var(--font-sm)', zIndex: 20,
          }}>
            Error al guardar: {tabContent.saveError}
          </div>
        )}
        <Editor
          height="100%"
          language={activeTab.language}
          theme="vs-dark"
          onMount={handleMount}
          options={{
            fontSize: 14,
            fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
            readOnly: false,
          }}
        />
      </div>
    </div>
  );
}
