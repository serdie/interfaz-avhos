# ROADMAP — AVHOS

## Fase 0: Fundación (completado)

- [x] Monorepo pnpm workspace
- [x] Tipos de dominio core (Workspace, AgentSession, Task, Skill, MCP, Model, Memory, etc.)
- [x] Sistema i18n con es-ES
- [x] Adaptador de almacenamiento (InMemory + TauriSQLite placeholder)
- [x] Abstracción de proveedores de modelos (Ollama + Cloud placeholders)
- [x] Registro de habilidades con loaders
- [x] Arquitectura MCP host-client-server
- [x] Memoria estructurada con búsqueda
- [x] Observabilidad: Logger, Tracer, EventLog
- [x] Orquestador con planner
- [x] Ejecución de herramientas y comandos
- [x] Design system: tema, hooks, componentes base
- [x] Shell IDE: activity bar, sidebar, editor, bottom panel, right panel, status bar
- [x] Paleta de comandos
- [x] 9 vistas de barra lateral
- [x] Editor Monaco integrado
- [x] Terminal placeholder
- [x] Datos seed realistas
- [x] Atajos de teclado globales

## Fase 1: Conexión backend (siguiente)

- [ ] Instalar dependencias y verificar build
- [ ] Conectar Tauri SQLite con rusqlite
- [ ] Implementar plugin shell de Tauri para terminal real
- [ ] Conectar proveedor Ollama (HTTP real a localhost:11434)
- [ ] Implementar cliente MCP sobre stdio (JSON-RPC)
- [ ] Persistir estado en SQLite (sesiones, tareas, memoria, ajustes)
- [ ] File system real (leer/escribir archivos del workspace)

## Fase 2: Agente funcional

- [ ] Orquestador con planning real (descomposición de tareas)
- [ ] Integración de herramientas en el bucle del agente
- [ ] Aprobación de acciones (flujo de confirmación)
- [ ] Habilidades ejecutables reales
- [ ] Memoria con embeddings (recuperación semántica)
- [ ] Resumen automático de sesiones
- [ ] Correcciones y aprendizajes guardados

## Fase 3: Mejora del IDE

- [ ] File tree real con watch
- [ ] Búsqueda global
- [ ] Git integration (diff, blame, commit)
- [ ] Multi-terminal (pestañas)
- [ ] Split editor
- [ ] Extensiones de Monaco (language servers)
- [ ] Tema claro pulido
- [ ] Migrar inline styles a CSS modules

## Fase 4: Auto-mejora

- [ ] Análisis de patrones de uso
- [ ] Sugerencias proactivas basadas en memoria
- [ ] Optimización de prompts basada en resultados verificados
- [ ] Habilidades generadas dinámicamente
- [ ] Documentación automática del código

## Principios

- Cada fase debe producir una versión utilizable
- No se añade complejidad sin valor directo
- Los placeholders se reemplazan por implementaciones reales, no se eliminan
- La arquitectura no cambia — se rellenan las implementaciones
