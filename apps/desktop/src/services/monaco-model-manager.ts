import type { editor, Uri } from 'monaco-editor';

/**
 * MonacoModelManager — gestiona modelos de Monaco por archivo.
 *
 * Cada archivo abierto tiene su propio ITextModel con una URI estable
 * derivada de su ruta relativa. Esto permite:
 * - Undo/redo preservado por archivo (no se pierde al cambiar pestaña)
 * - Lenguaje asignado al modelo, no al editor
 * - Cambio de pestaña instantáneo via editor.setModel()
 * - ViewState (cursor, scroll) guardable y restaurable por pestaña
 * - Futuro guardado: model.getValue() da el contenido actual
 * - Futuro split view: múltiples editores pueden compartir el mismo modelo
 */
export class MonacoModelManager {
  private models = new Map<string, editor.ITextModel>();
  private viewStates = new Map<string, editor.ICodeEditorViewState | null>();
  private originalContents = new Map<string, string>();
  private monacoRef: typeof import('monaco-editor') | null = null;

  /** Inicializa con la instancia de Monaco (se llama una vez en onMount). */
  init(monaco: typeof import('monaco-editor')) {
    this.monacoRef = monaco;
  }

  /** Construye una URI estable para una ruta de archivo relativa. */
  private uriForPath(filePath: string): Uri {
    if (!this.monacoRef) throw new Error('MonacoModelManager no inicializado');
    const cleanPath = filePath.replace(/\\/g, '/');
    return this.monacoRef.Uri.parse(`file:///${cleanPath}`);
  }

  /**
   * Obtiene o crea el modelo para una ruta de archivo.
   * Si el modelo ya existe (pestaña reabierta), lo reutiliza sin recargar.
   */
  getOrCreateModel(
    filePath: string,
    language: string,
    content: string,
  ): editor.ITextModel {
    if (!this.monacoRef) throw new Error('MonacoModelManager no inicializado');

    const uri = this.uriForPath(filePath);
    const existing = this.monacoRef.editor.getModel(uri);

    if (existing) {
      this.models.set(filePath, existing);
      return existing;
    }

    const model = this.monacoRef.editor.createModel(content, language, uri);
    this.models.set(filePath, model);
    this.originalContents.set(filePath, content);
    return model;
  }

  /** Obtiene el modelo existente para una ruta, o null si no existe. */
  getModel(filePath: string): editor.ITextModel | null {
    return this.models.get(filePath) ?? null;
  }

  /** Guarda el viewState (cursor, scroll) de una pestaña. */
  saveViewState(filePath: string, editorInstance: editor.IStandaloneCodeEditor) {
    const state = editorInstance.saveViewState();
    this.viewStates.set(filePath, state);
  }

  /** Restaura el viewState de una pestaña en el editor. */
  restoreViewState(filePath: string, editorInstance: editor.IStandaloneCodeEditor) {
    const state = this.viewStates.get(filePath);
    if (state) {
      editorInstance.restoreViewState(state);
    }
  }

  /** Elimina el modelo y su viewState (al cerrar pestaña). */
  disposeModel(filePath: string) {
    const model = this.models.get(filePath);
    if (model) {
      model.dispose();
      this.models.delete(filePath);
    }
    this.viewStates.delete(filePath);
    this.originalContents.delete(filePath);
  }

  /** Comprueba si un modelo ha sido modificado respecto a su contenido original. */
  isDirty(filePath: string): boolean {
    const model = this.models.get(filePath);
    if (!model) return false;
    const original = this.originalContents.get(filePath);
    if (original === undefined) return false;
    return model.getValue() !== original;
  }

  /** Obtiene el contenido actual del modelo. */
  getModelValue(filePath: string): string | null {
    const model = this.models.get(filePath);
    return model?.getValue() ?? null;
  }

  /** Actualiza el contenido original de referencia tras un guardado exitoso. */
  markClean(filePath: string) {
    const model = this.models.get(filePath);
    if (model) {
      this.originalContents.set(filePath, model.getValue());
    }
  }

  /** Limpia todos los modelos y viewStates. */
  disposeAll() {
    for (const model of this.models.values()) {
      model.dispose();
    }
    this.models.clear();
    this.viewStates.clear();
    this.originalContents.clear();
  }
}

/** Instancia singleton compartida. */
export const modelManager = new MonacoModelManager();
