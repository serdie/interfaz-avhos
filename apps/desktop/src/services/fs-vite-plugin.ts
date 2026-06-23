import { Plugin } from 'vite';
import {
  readdirSync, statSync, readFileSync, writeFileSync,
  existsSync, realpathSync,
} from 'node:fs';
import { join, resolve, sep } from 'node:path';

/** Tamaño máximo del body de escritura: 10 MB. */
const MAX_WRITE_BODY = 10 * 1024 * 1024;

/**
 * Vite plugin that exposes a dev-server middleware at /__fs__/*
 * to read and write the real filesystem.
 *
 * Security model:
 * 1. Null bytes are rejected outright.
 * 2. Paths are resolved with resolve() (normaliza ../, ./, barras).
 * 3. realpathSync resolves symlinks to their canonical target.
 * 4. The canonical path must be the root itself or start with root + sep.
 *    This prevents prefix attacks (e.g. /project-evil escaping /project).
 * 5. Write body is capped at MAX_WRITE_BODY bytes.
 * 6. All error messages are in Spanish.
 */
export function filesystemDevPlugin(projectRoot: string): Plugin {
  const root = resolve(projectRoot);
  const rootWithSep = root + sep;

  return {
    name: 'avhos-filesystem-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/__fs__/')) {
          next();
          return;
        }

        res.setHeader('Content-Type', 'application/json');

        try {
          if (url.startsWith('/__fs__/root')) {
            res.end(JSON.stringify({ root }));
            return;
          }

          if (url.startsWith('/__fs__/readdir')) {
            const params = new URLSearchParams(url.split('?')[1] ?? '');
            const requestedPath = params.get('path') ?? '';
            const validation = validatePath(requestedPath, root, rootWithSep);

            if (!validation.valid) {
              res.statusCode = 403;
              res.end(JSON.stringify({ entries: [], error: validation.error }));
              return;
            }

            const absPath = validation.absPath;

            if (!existsSync(absPath)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ entries: [], error: 'Ruta no encontrada' }));
              return;
            }

            const stat = statSync(absPath);
            if (!stat.isDirectory()) {
              res.statusCode = 400;
              res.end(JSON.stringify({ entries: [], error: 'No es un directorio' }));
              return;
            }

            const entries = readdirSync(absPath, { withFileTypes: true })
              .filter((d) => !d.name.startsWith('.') || d.name === '.gitignore' || d.name === '.prettierrc')
              .map((d) => ({
                name: d.name,
                path: relativePath(root, join(absPath, d.name)),
                isDirectory: d.isDirectory(),
              }))
              .sort((a, b) => {
                if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
                return a.name.localeCompare(b.name);
              });

            res.end(JSON.stringify({ entries, error: null }));
            return;
          }

          if (url.startsWith('/__fs__/readfile')) {
            const params = new URLSearchParams(url.split('?')[1] ?? '');
            const requestedPath = params.get('path') ?? '';
            const validation = validatePath(requestedPath, root, rootWithSep);

            if (!validation.valid) {
              res.statusCode = 403;
              res.end(JSON.stringify({ content: '', error: validation.error }));
              return;
            }

            const absPath = validation.absPath;

            if (!existsSync(absPath)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ content: '', error: 'Archivo no encontrado' }));
              return;
            }

            const stat = statSync(absPath);
            if (stat.isDirectory()) {
              res.statusCode = 400;
              res.end(JSON.stringify({ content: '', error: 'No se puede leer un directorio como archivo' }));
              return;
            }

            const content = readFileSync(absPath, 'utf-8');
            res.end(JSON.stringify({ content, error: null }));
            return;
          }

          if (url.startsWith('/__fs__/stat')) {
            const params = new URLSearchParams(url.split('?')[1] ?? '');
            const requestedPath = params.get('path') ?? '';
            const validation = validatePath(requestedPath, root, rootWithSep);

            if (!validation.valid) {
              res.statusCode = 403;
              res.end(JSON.stringify({ exists: false, isDirectory: false, error: validation.error }));
              return;
            }

            const absPath = validation.absPath;
            const exists = existsSync(absPath);
            const stat = exists ? statSync(absPath) : null;
            res.end(JSON.stringify({
              exists,
              isDirectory: stat?.isDirectory() ?? false,
            }));
            return;
          }

          if (url.startsWith('/__fs__/writefile')) {
            let body = '';
            let bodySize = 0;
            let tooLarge = false;

            req.on('data', (chunk: Buffer) => {
              bodySize += chunk.length;
              if (bodySize > MAX_WRITE_BODY) {
                tooLarge = true;
                req.destroy();
                return;
              }
              body += chunk.toString();
            });

            req.on('end', () => {
              if (tooLarge) {
                res.statusCode = 413;
                res.end(JSON.stringify({ error: `Cuerpo demasiado grande (máximo ${MAX_WRITE_BODY / 1024 / 1024} MB)` }));
                return;
              }

              try {
                const data = JSON.parse(body) as { path?: string; content?: string };
                const requestedPath = data.path ?? '';
                const content = data.content ?? '';

                const validation = validatePath(requestedPath, root, rootWithSep, true);

                if (!validation.valid) {
                  res.statusCode = 403;
                  res.end(JSON.stringify({ error: validation.error }));
                  return;
                }

                const absPath = validation.absPath;

                // Si el archivo ya existe, comprobar que no es directorio
                if (existsSync(absPath)) {
                  const stat = statSync(absPath);
                  if (stat.isDirectory()) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'No se puede sobrescribir un directorio' }));
                    return;
                  }
                }

                writeFileSync(absPath, content, 'utf-8');
                res.end(JSON.stringify({ error: null }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  error: err instanceof Error ? err.message : 'Error al escribir archivo',
                }));
              }
            });
            return;
          }

          next();
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({
            entries: [],
            error: err instanceof Error ? err.message : 'Error desconocido',
          }));
        }
      });
    },
  };
}

/**
 * Validación robusta de ruta:
 * 1. Rechaza null bytes.
 * 2. Rechaza rutas UNC (\\server\share) en Windows.
 * 3. Normaliza con resolve() (elimina ../, ./, barras mixtas).
 * 4. Si el archivo existe, usa realpathSync para resolver symlinks.
 * 5. Comprueba que la ruta canónica es root o empieza con root + sep.
 *
 * @param allowNonExistent — para writefile, el archivo puede no existir aún.
 *   En ese caso, se valida el directorio padre con realpathSync.
 */
function validatePath(
  requestedPath: string,
  root: string,
  rootWithSep: string,
  allowNonExistent = false,
): { valid: true; absPath: string } | { valid: false; error: string } {
  // 1. Null bytes
  if (requestedPath.includes('\0')) {
    return { valid: false, error: 'Ruta contiene bytes nulos — rechazada' };
  }

  // 2. UNC paths en Windows (\\server\share o //server/share)
  if (/^(\\\\|\/\/)[^\/\\]+[\/\\]/.test(requestedPath)) {
    return { valid: false, error: 'Rutas UNC no permitidas' };
  }

  // 3. Normalización sintáctica
  const normalized = resolve(root, requestedPath);

  // 4. Comprobación de límite con separador estricto
  if (normalized !== root && !normalized.startsWith(rootWithSep)) {
    return { valid: false, error: 'Ruta fuera del directorio raíz del proyecto' };
  }

  // 5. Resolución canónica (symlinks)
  try {
    if (existsSync(normalized)) {
      const canonical = realpathSync(normalized);
      if (canonical !== root && !canonical.startsWith(rootWithSep)) {
        return { valid: false, error: 'Symlink apunta fuera del directorio raíz del proyecto' };
      }
      return { valid: true, absPath: normalized };
    }

    if (allowNonExistent) {
      // Para archivos nuevos, validar el directorio padre
      const parent = resolve(normalized, '..');
      if (existsSync(parent)) {
        const canonicalParent = realpathSync(parent);
        if (canonicalParent !== root && !canonicalParent.startsWith(rootWithSep)) {
          return { valid: false, error: 'El directorio destino está fuera del proyecto (symlink)' };
        }
      }
      return { valid: true, absPath: normalized };
    }

    return { valid: false, error: 'Ruta no encontrada' };
  } catch {
    return { valid: false, error: 'No se pudo resolver la ruta canónica' };
  }
}

function relativePath(root: string, abs: string): string {
  const rel = abs.slice(root.length).replace(/\\/g, '/');
  return rel.startsWith('/') ? rel.slice(1) : rel;
}
