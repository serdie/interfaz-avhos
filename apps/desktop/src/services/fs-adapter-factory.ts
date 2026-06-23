import type { FilesystemAdapter } from '@avhos/core';
import { ViteDevFsAdapter } from './fs-vite-adapter.js';
import { TauriFsAdapter } from './fs-tauri-adapter.js';
import { getLastProjectPath, setLastProjectPath } from './project-persistence.js';

/**
 * Detecta si AVHOS se está ejecutando dentro de Tauri (desktop real)
 * o en el navegador con el dev server de Vite.
 *
 * En Tauri, el objeto global `window.__TAURI_INTERNALS__` existe.
 * En el navegador con Vite, no existe.
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * En Tauri, pide al usuario que seleccione el directorio del proyecto
 * usando el dialog nativo del sistema operativo.
 *
 * Si el usuario cancela, devuelve null.
 */
async function selectProjectDirectory(): Promise<string | null> {
  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Selecciona el directorio del proyecto',
    });
    if (typeof selected === 'string') {
      return selected;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Verifica que un directorio existe y es accesible.
 */
async function isValidDirectory(path: string): Promise<boolean> {
  try {
    const { exists, stat } = await import('@tauri-apps/plugin-fs');
    const pathExists = await exists(path);
    if (!pathExists) return false;
    const s = await stat(path);
    return s.isDirectory;
  } catch {
    return false;
  }
}

/**
 * Crea el adaptador de filesystem adecuado para el entorno actual.
 *
 * - En el dev server de Vite (navegador): usa ViteDevFsAdapter,
 *   que lee/escribe disco real via el middleware /__fs__/*.
 *
 * - En Tauri (desktop): usa TauriFsAdapter,
 *   que lee/escribe disco real via @tauri-apps/plugin-fs.
 *   La ruta raíz se obtiene así:
 *   1. Intentar cargar el último directorio usado (persistido)
 *   2. Si existe y es válido, usarlo directamente
 *   3. Si no, pedir selección con dialog nativo
 *   4. Si el usuario cancela, fallback a get_workspace_root
 *
 * Ambos implementan la misma interfaz FilesystemAdapter,
 * por lo que el resto del código no necesita saber en qué entorno está.
 */
export async function createFsAdapter(): Promise<FilesystemAdapter> {
  if (isTauriEnvironment()) {
    // 1. Intentar cargar el último directorio persistido
    const lastPath = await getLastProjectPath();
    if (lastPath && await isValidDirectory(lastPath)) {
      return new TauriFsAdapter(lastPath);
    }

    // 2. Si no hay último directorio o no es válido, pedir selección
    const selectedPath = await selectProjectDirectory();

    if (selectedPath) {
      // Persistir para la próxima vez
      await setLastProjectPath(selectedPath);
      return new TauriFsAdapter(selectedPath);
    }

    // 3. Fallback: usar get_workspace_root del backend de Tauri
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const fallbackPath = await invoke<string>('get_workspace_root');
      return new TauriFsAdapter(fallbackPath);
    } catch {
      return new TauriFsAdapter('.');
    }
  }

  // Entorno Vite dev (navegador)
  return new ViteDevFsAdapter();
}

/**
 * Fuerza la selección de un nuevo directorio de proyecto.
 * Persiste la nueva ruta y devuelve el adaptador.
 * Solo aplicable en Tauri.
 */
export async function selectNewProject(): Promise<TauriFsAdapter | null> {
  if (!isTauriEnvironment()) return null;

  const selectedPath = await selectProjectDirectory();
  if (!selectedPath) return null;

  await setLastProjectPath(selectedPath);
  return new TauriFsAdapter(selectedPath);
}
