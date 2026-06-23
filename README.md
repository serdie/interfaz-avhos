# AVHOS

**Entorno de programación nativo IA para escritorio**

AVHOS es un IDE privado, local-first, diseñado para un único usuario avanzado. No es un SaaS, no hay multi-tenant, no hay autenticación en la nube. Es una herramienta personal de programación con IA integrada.

## Estado del proyecto

**Versión:** 0.1.0 — Fundación arquitectónica completa

Este es el andamiaje fundacional. Todas las arquitecturas están definidas, las interfaces están tipadas, y los placeholders están claramente etiquetados. La aplicación se ejecuta como una web app (Vite + React) con el shell de Tauri configurado.

### Lo que funciona ahora

- **Shell IDE completo**: barra de actividad, barra lateral, editor con pestañas, panel inferior (terminal), panel derecho, barra de estado
- **Explorador de workspace real**: lee el sistema de archivos real via adaptador Vite dev server (Node.js `fs`), muestra la estructura real del monorepo con expansión recursiva de directorios
- **Paleta de comandos** con navegación por teclado
- **9 vistas de barra lateral**: Explorador, Agente (chat), Planificador, Memoria, Habilidades, MCP, Modelos, Registros, Ajustes
- **Editor Monaco** integrado con tema oscuro personalizado
- **Terminal placeholder** con comandos básicos (help, clear, status, echo)
- **Sistema de temas** dark-first con variables CSS
- **i18n completo** en español (España) con fallback
- **Store global** con Zustand (estado de UI separado del estado de dominio)
- **Contenedor de servicios** que cablea todos los paquetes

### Arquitectura del explorador de archivos

El explorador usa una arquitectura de 3 capas con adaptadores:

1. **`FilesystemAdapter`** (interfaz en `packages/core`): contratto compartido para acceso al sistema de archivos
2. **`ViteDevFsAdapter`**: lee disco real via middleware del dev server (Node.js `fs`) — **funciona ahora en el browser preview**
3. **`TauriFsAdapter`**: usará `@tauri-apps/plugin-fs` en producción desktop — **SCAFFOLDED, misma interfaz**
4. **`WorkspaceService`**: capa de dominio que construye el `FileTreeNode` tree usando el adaptador
5. **`ExplorerPanel`**: renderiza nodos reales con expansión lazy, estados de carga y error

### Lo que es real vs. mock

| Panel | Estado | Fuente de datos |
|-------|--------|----------------|
| **Explorador** | **REAL** | Sistema de archivos real via `ViteDevFsAdapter` |
| **Agente (Chat)** | Mock | Seed data |
| **Planificador** | Mock | Seed data |
| **Memoria** | Mock | Seed data |
| **Habilidades** | Mock | Seed data |
| **MCP** | Mock | Seed data |
| **Modelos** | Mock | Seed data |
| **Registros** | Mock | Seed data |
| **Ajustes** | Mock | Seed data |

### Lo que es placeholder (etiquetado claramente)

- **Backend Tauri**: comando `ping` funcional, SQLite y shell pendientes
- **Proveedor Ollama**: interfaz completa, HTTP no conectado
- **Proveedor Cloud**: interfaz completa, API no conectada
- **Cliente MCP**: stub client, protocolo JSON-RPC pendiente
- **Terminal**: comandos locales simulados, plugin shell de Tauri pendiente
- **Orquestador**: procesamiento de mensajes básico, planning real pendiente
- **Almacenamiento SQLite**: adaptador InMemory funcional, Tauri SQLite pendiente

## Arquitectura

```
avhos/
├── packages/
│   ├── core/          # Tipos de dominio, interfaces, branded types
│   ├── i18n/          # Sistema de localización (es-ES default, en-US parcial)
│   ├── storage/       # Adaptador de persistencia (InMemory + TauriSQLite placeholder)
│   ├── models/        # Abstracción de proveedores de modelos (Ollama + Cloud)
│   ├── skills/        # Registro de habilidades, loaders, validadores
│   ├── mcp/           # Host MCP, cliente stub, arquitectura client-server
│   ├── memory/        # Memoria estructurada, recuperación, preferencias
│   ├── observability/ # Logger, Tracer, EventLog
│   ├── tools/         # Ejecución de herramientas, comandos, registros
│   ├── orchestrator/  # Runtime de agente, planner, orquestación
│   └── ui/            # Design system, hooks (theme, i18n), componentes base
├── apps/
│   └── desktop/       # App Tauri + React + Vite
│       ├── src/
│       │   ├── components/    # Layout IDE, paneles, paleta, barra estado
│       │   ├── store/         # Zustand store (estado UI)
│       │   ├── services/      # Contenedor de servicios (composition root)
│       │   ├── data/          # Datos seed
│       │   └── styles/        # CSS global
│       └── src-tauri/         # Backend Rust (Tauri)
└── pnpm-workspace.yaml
```

### Principios de diseño

- **Límites estrictos entre paquetes**: cada paquete expone una API tipada, sin fugas de implementación
- **Estado de UI ≠ estado de dominio**: Zustand para UI, capa de servicios para dominio
- **Placeholders etiquetados**: nada falso — todo lo no implementado está marcado con `SCAFFOLDED` o `PLACEHOLDER`
- **Dark-first**: el tema oscuro es el primario, el claro es secundario
- **Keyboard-first**: atajos globales (Ctrl+P, Ctrl+B, Ctrl+J, Ctrl+L)
- **Localización completa**: todo el texto UI vive en recursos i18n, nunca en componentes

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Desktop shell | Tauri 2 |
| Frontend | React 18 + TypeScript 5 |
| Build | Vite 5 |
| Editor | Monaco Editor |
| Estado UI | Zustand |
| Storage | SQLite (vía Tauri) / InMemory |
| i18n | Sistema propio (es-ES default) |
| Backend | Rust (Tauri) |
| Monorepo | pnpm workspaces |

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Desarrollo web (sin Tauri)
pnpm --filter @avhos/desktop dev

# Desarrollo Tauri (requiere Rust + Tauri CLI)
pnpm --filter @avhos/desktop tauri dev

# Build
pnpm --filter @avhos/desktop build

# Typecheck
pnpm -r typecheck
```

## Atajos de teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl+P` | Paleta de comandos |
| `Ctrl+B` | Alternar barra lateral |
| `Ctrl+J` | Alternar panel inferior |
| `Ctrl+L` | Alternar panel derecho |

## Localización

El idioma por defecto es **español (España)**. Las claves de traducción están en `packages/i18n/src/locales/es-ES.ts`. El sistema soporta interpolación y fallback automático.

## Licencia

Privado. Uso personal.
