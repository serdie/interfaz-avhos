import type { FilesystemAdapter, ReadDirResult } from '@avhos/core';

/**
 * Tauri filesystem adapter — para ejecución desktop real con Tauri.
 * Usa @tauri-apps/plugin-fs para leer y escribir el sistema de archivos real.
 *
 * Permisos requeridos en capabilities/default.json:
 * - fs:allow-read-file (readTextFile)
 * - fs:allow-write-file (writeTextFile)
 * - fs:allow-read-dir (readDir)
 * - fs:allow-exists (exists)
 * - fs:allow-stat (stat)
 * - fs:scope con allow: [{ path: "**" }] o restringido al directorio del proyecto
 *
 * La seguridad de paths en Tauri se delega a los scopes del plugin fs.
 * El scope restringe qué rutas son accesibles desde el frontend.
 */
export class TauriFsAdapter implements FilesystemAdapter {
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  async readDir(absolutePath: string): Promise<ReadDirResult> {
    try {
      const { readDir } = await import('@tauri-apps/plugin-fs');
      const entries = await readDir(absolutePath);

      const mapped = entries
        .filter((e) => !e.name.startsWith('.') || e.name === '.gitignore' || e.name === '.prettierrc')
        .map((e) => ({
          name: e.name,
          path: this.toRelative(absolutePath, e.name),
          isDirectory: e.isDirectory,
        }))
        .sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

      return { entries: mapped, error: null };
    } catch (err) {
      return {
        entries: [],
        error: err instanceof Error ? err.message : 'Error al leer directorio',
      };
    }
  }

  async stat(absolutePath: string): Promise<{ exists: boolean; isDirectory: boolean }> {
    try {
      const { exists, stat } = await import('@tauri-apps/plugin-fs');
      const pathExists = await exists(absolutePath);
      if (!pathExists) return { exists: false, isDirectory: false };
      const s = await stat(absolutePath);
      return { exists: true, isDirectory: s.isDirectory };
    } catch {
      return { exists: false, isDirectory: false };
    }
  }

  async readFile(absolutePath: string): Promise<{ content: string; error: string | null }> {
    try {
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      const content = await readTextFile(absolutePath);
      return { content, error: null };
    } catch (err) {
      return {
        content: '',
        error: err instanceof Error ? err.message : 'Error al leer archivo',
      };
    }
  }

  async writeFile(absolutePath: string, content: string): Promise<{ error: string | null }> {
    try {
      const { writeTextFile } = await import('@tauri-apps/plugin-fs');
      await writeTextFile(absolutePath, content);
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Error al escribir archivo',
      };
    }
  }

  async getRootPath(): Promise<string> {
    return this.rootPath;
  }

  /** Construye la ruta relativa desde la raíz del proyecto. */
  private toRelative(dirPath: string, name: string): string {
    const full = `${dirPath}/${name}`;
    if (full.startsWith(this.rootPath)) {
      return full.slice(this.rootPath.length).replace(/\\/g, '/').replace(/^\//, '');
    }
    return name;
  }
}
