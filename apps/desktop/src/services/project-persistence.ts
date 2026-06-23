/**
 * Persistencia del último directorio de proyecto seleccionado.
 *
 * En Tauri: usa @tauri-apps/plugin-store (almacenamiento key-value
 * persistente en disco, guardado en $APPDATA/avhos).
 *
 * En Vite dev (navegador): usa localStorage como fallback.
 *
 * Por qué plugin-store y no localStorage en Tauri:
 * - localStorage vive en el WebView y puede ser limpiado por el sistema
 * - plugin-store escribe a disco real en el directorio de datos de la app
 * - Sobrevive entre sesiones del ejecutable desktop
 * - Es la solución nativa recomendada por Tauri para configuración persistente
 */

const STORE_FILE = 'avhos-settings.json';
const KEY_LAST_PROJECT = 'lastProjectPath';

export async function getLastProjectPath(): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      const path = await store.get<string>(KEY_LAST_PROJECT);
      return path ?? null;
    }
  } catch {
    // fallback a localStorage
  }

  try {
    return localStorage.getItem(KEY_LAST_PROJECT);
  } catch {
    return null;
  }
}

export async function setLastProjectPath(path: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      await store.set(KEY_LAST_PROJECT, path);
      await store.save();
      return;
    }
  } catch {
    // fallback a localStorage
  }

  try {
    localStorage.setItem(KEY_LAST_PROJECT, path);
  } catch {
    // no-op
  }
}
