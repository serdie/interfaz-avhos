import type {
  Workspace,
  Project,
  AgentSession,
  Task,
  MemoryEntry,
  Skill,
  MCPServer,
  ModelProvider,
  ModelProfile,
  AppSetting,
  LogEntry,
} from '@avhos/core';
import { uuid, isoNow } from '@avhos/core';

/**
 * Seed data — provides realistic demo content so the UI is not empty.
 * This data is loaded on first run and can be cleared from settings.
 * All text is in es-ES per localization requirements.
 */

export function createSeedWorkspace(): Workspace {
  const now = isoNow();
  return {
    id: uuid('seed-workspace-001'),
    name: 'Proyecto principal',
    rootPath: '~/proyectos/avhos',
    createdAt: now,
    updatedAt: now,
    settings: {
      defaultModelProfileId: uuid('seed-profile-ollama'),
      autoSave: true,
      terminalShell: 'powershell',
      excludedGlobs: ['node_modules', 'dist', '.git', 'target'],
    },
  };
}

export function createSeedProjects(wsId: string): Project[] {
  const now = isoNow();
  return [
    {
      id: uuid('seed-project-001'),
      workspaceId: wsId as any,
      name: 'avhos-core',
      path: '~/proyectos/avhos/packages/core',
      language: 'TypeScript',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid('seed-project-002'),
      workspaceId: wsId as any,
      name: 'avhos-desktop',
      path: '~/proyectos/avhos/apps/desktop',
      language: 'TypeScript',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function createSeedSessions(wsId: string): AgentSession[] {
  const now = isoNow();
  return [
    {
      id: uuid('seed-session-001'),
      workspaceId: wsId as any,
      title: 'Revisión de arquitectura',
      status: 'completed',
      modelProfileId: uuid('seed-profile-ollama'),
      systemPrompt: 'Eres un asistente de programación experto en arquitectura de software.',
      messages: [
        {
          id: uuid('seed-msg-001'),
          sessionId: uuid('seed-session-001'),
          role: 'user',
          content: 'Analiza la estructura del monorepo y sugiere mejoras.',
          modelProfileId: null,
          toolCallId: null,
          metadata: {},
          createdAt: now,
        },
        {
          id: uuid('seed-msg-002'),
          sessionId: uuid('seed-session-001'),
          role: 'assistant',
          content: 'La estructura del monorepo está bien organizada. Los paquetes tienen límites claros: core para tipos de dominio, storage para persistencia, models para abstracción de proveedores, etc. Sugiero añadir un paquete de validación compartido y considerar un paquete de configuración centralizado.',
          modelProfileId: uuid('seed-profile-ollama'),
          toolCallId: null,
          metadata: {},
          createdAt: now,
        },
      ],
      activeTaskId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid('seed-session-002'),
      workspaceId: wsId as any,
      title: 'Implementar MCP client real',
      status: 'idle',
      modelProfileId: uuid('seed-profile-cloud'),
      systemPrompt: null,
      messages: [],
      activeTaskId: null,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function createSeedTasks(): Task[] {
  const now = isoNow();
  return [
    {
      id: uuid('seed-task-001'),
      sessionId: uuid('seed-session-002'),
      title: 'Implementar protocolo MCP sobre stdio',
      description: 'Crear un cliente MCP real que use JSON-RPC sobre stdio para comunicarse con servidores MCP.',
      status: 'pending',
      priority: 'high',
      order: 0,
      parentTaskId: null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    },
    {
      id: uuid('seed-task-002'),
      sessionId: uuid('seed-session-002'),
      title: 'Integrar SQLite con Tauri',
      description: 'Conectar el adaptador de almacenamiento con el backend de Rust usando rusqlite.',
      status: 'in_progress',
      priority: 'high',
      order: 1,
      parentTaskId: null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    },
    {
      id: uuid('seed-task-003'),
      sessionId: uuid('seed-session-001'),
      title: 'Añadir validación de esquemas',
      description: 'Implementar validación con Zod para los tipos de dominio críticos.',
      status: 'completed',
      priority: 'medium',
      order: 0,
      parentTaskId: null,
      createdAt: now,
      updatedAt: now,
      completedAt: now,
    },
  ];
}

export function createSeedMemory(wsId: string): MemoryEntry[] {
  const now = isoNow();
  return [
    {
      id: uuid('seed-mem-001'),
      workspaceId: wsId as any,
      type: 'preference',
      title: 'Preferencia de tema oscuro',
      content: 'El usuario prefiere tema oscuro con alta densidad de información.',
      tags: ['ui', 'theme'],
      importance: 'medium',
      source: 'user',
      embedding: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid('seed-mem-002'),
      workspaceId: wsId as any,
      type: 'project_fact',
      title: 'Estructura del monorepo',
      content: 'El proyecto usa pnpm workspaces con packages/ para librerías y apps/ para aplicaciones. Los límites entre paquetes son estrictos.',
      tags: ['architecture', 'monorepo'],
      importance: 'high',
      source: 'agent',
      embedding: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid('seed-mem-003'),
      workspaceId: wsId as any,
      type: 'decision',
      title: 'Zustand para estado de UI',
      content: 'Se eligió Zustand sobre Redux por su simplicidad y porque el estado de UI es separado del estado de dominio. El estado de dominio vive en la capa de servicios.',
      tags: ['architecture', 'state-management'],
      importance: 'high',
      source: 'agent',
      embedding: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid('seed-mem-004'),
      workspaceId: wsId as any,
      type: 'correction',
      title: 'Corrección: no usar inline styles',
      content: 'El usuario corrigió el uso excesivo de inline styles. Se debe migrar a CSS modules o una solución basada en clases cuando el diseño se estabilice.',
      tags: ['correction', 'styling'],
      importance: 'medium',
      source: 'user',
      embedding: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid('seed-mem-005'),
      workspaceId: wsId as any,
      type: 'verified_outcome',
      title: 'Patrón de adaptador de almacenamiento funciona',
      content: 'El patrón StorageAdapter con implementación InMemory para tests y TauriSqlite para producción funciona correctamente. Mantener este patrón para futuras capas de abstracción.',
      tags: ['pattern', 'storage'],
      importance: 'high',
      source: 'system',
      embedding: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function createSeedSkills(): Skill[] {
  const now = isoNow();
  return [
    {
      id: uuid('seed-skill-001'),
      name: 'refactor-extract',
      version: '1.0.0',
      description: 'Extrae código seleccionado a una función o módulo independiente.',
      category: 'refactoring',
      parameters: [
        { name: 'selection', type: 'string', description: 'Código a extraer', required: true, defaultValue: null, options: null },
        { name: 'name', type: 'string', description: 'Nombre de la nueva función', required: true, defaultValue: null, options: null },
      ],
      promptTemplate: 'Refactoriza el siguiente código extrayéndolo a una función llamada {name}:\n\n{selection}',
      sourcePath: null,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid('seed-skill-002'),
      name: 'generate-tests',
      version: '1.0.0',
      description: 'Genera pruebas unitarias para el archivo o función especificada.',
      category: 'testing',
      parameters: [
        { name: 'filePath', type: 'file', description: 'Archivo a testear', required: true, defaultValue: null, options: null },
        { name: 'framework', type: 'select', description: 'Framework de testing', required: false, defaultValue: 'vitest', options: ['vitest', 'jest', 'mocha'] },
      ],
      promptTemplate: 'Genera pruebas unitarias usando {framework} para el archivo: {filePath}',
      sourcePath: null,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid('seed-skill-003'),
      name: 'analyze-architecture',
      version: '1.0.0',
      description: 'Analiza la arquitectura del proyecto e identifica problemas de diseño.',
      category: 'analysis',
      parameters: [
        { name: 'scope', type: 'select', description: 'Alcance del análisis', required: false, defaultValue: 'full', options: ['full', 'package', 'module'] },
      ],
      promptTemplate: 'Analiza la arquitectura del proyecto (alcance: {scope}). Identifica acoplamiento, cohesión y sugerencias de mejora.',
      sourcePath: null,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid('seed-skill-004'),
      name: 'generate-docs',
      version: '1.0.0',
      description: 'Genera documentación para funciones, módulos o APIs.',
      category: 'documentation',
      parameters: [
        { name: 'target', type: 'string', description: 'Elemento a documentar', required: true, defaultValue: null, options: null },
        { name: 'format', type: 'select', description: 'Formato de documentación', required: false, defaultValue: 'markdown', options: ['markdown', 'jsdoc', 'rustdoc'] },
      ],
      promptTemplate: 'Genera documentación en formato {format} para: {target}',
      sourcePath: null,
      enabled: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function createSeedMcpServers(): MCPServer[] {
  const now = isoNow();
  return [
    {
      id: uuid('seed-mcp-001'),
      name: 'filesystem-server',
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '~/proyectos'],
      env: {},
      url: null,
      status: 'disconnected',
      autoConnect: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid('seed-mcp-002'),
      name: 'git-server',
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-git'],
      env: {},
      url: null,
      status: 'disconnected',
      autoConnect: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function createSeedProviders(): ModelProvider[] {
  const now = isoNow();
  return [
    {
      id: uuid('seed-provider-ollama'),
      name: 'Ollama Local',
      type: 'ollama',
      baseUrl: 'http://localhost:11434',
      apiKey: null,
      capabilities: ['chat', 'completion', 'embedding'],
      enabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid('seed-provider-cloud'),
      name: 'Cloud API',
      type: 'cloud',
      baseUrl: 'https://api.example.com/v1',
      apiKey: null,
      capabilities: ['chat', 'completion', 'tool_use', 'vision'],
      enabled: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function createSeedProfiles(): ModelProfile[] {
  const now = isoNow();
  return [
    {
      id: uuid('seed-profile-ollama'),
      providerId: uuid('seed-provider-ollama'),
      name: 'Llama 3.1 8B (Local)',
      modelId: 'llama3.1:8b',
      displayName: 'Llama 3.1 8B',
      contextWindow: 128000,
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt: 'Eres un asistente de programación experto. Responde en español.',
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid('seed-profile-cloud'),
      providerId: uuid('seed-provider-cloud'),
      name: 'Claude 3.5 Sonnet (Cloud)',
      modelId: 'claude-3.5-sonnet',
      displayName: 'Claude 3.5 Sonnet',
      contextWindow: 200000,
      temperature: 0.7,
      maxTokens: 8192,
      systemPrompt: 'Eres un asistente de programación experto. Responde en español.',
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function createSeedSettings(): AppSetting[] {
  const now = isoNow();
  return [
    { id: uuid('seed-set-001'), key: 'theme', value: 'dark', category: 'appearance', description: 'Tema de la interfaz', updatedAt: now },
    { id: uuid('seed-set-002'), key: 'language', value: 'es-ES', category: 'general', description: 'Idioma de la interfaz', updatedAt: now },
    { id: uuid('seed-set-003'), key: 'editor.fontSize', value: 14, category: 'editor', description: 'Tamaño de fuente del editor', updatedAt: now },
    { id: uuid('seed-set-004'), key: 'editor.tabSize', value: 2, category: 'editor', description: 'Tamaño de tabulación', updatedAt: now },
    { id: uuid('seed-set-005'), key: 'editor.wordWrap', value: true, category: 'editor', description: 'Ajuste de línea', updatedAt: now },
    { id: uuid('seed-set-006'), key: 'terminal.shell', value: 'powershell', category: 'terminal', description: 'Shell del terminal', updatedAt: now },
    { id: uuid('seed-set-007'), key: 'autoSave', value: true, category: 'general', description: 'Guardado automático', updatedAt: now },
  ];
}

export function createSeedLogs(): LogEntry[] {
  const now = isoNow();
  return [
    { id: uuid('seed-log-001'), level: 'info', category: 'system', message: 'AVHOS iniciado correctamente', data: null, traceId: null, createdAt: now },
    { id: uuid('seed-log-002'), level: 'info', category: 'storage', message: 'Almacenamiento en memoria inicializado', data: { adapter: 'InMemoryStorageAdapter' }, traceId: null, createdAt: now },
    { id: uuid('seed-log-003'), level: 'warn', category: 'model', message: 'Proveedor Ollama no reachable — usando placeholder', data: { baseUrl: 'http://localhost:11434' }, traceId: null, createdAt: now },
    { id: uuid('seed-log-004'), level: 'info', category: 'mcp', message: '2 servidores MCP registrados (desconectados)', data: { count: 2 }, traceId: null, createdAt: now },
    { id: uuid('seed-log-005'), level: 'info', category: 'skill', message: '4 habilidades cargadas (3 activas)', data: { total: 4, enabled: 3 }, traceId: null, createdAt: now },
  ];
}
