import type { TranslationResource } from '../types.js';

/**
 * English (US) translation resources — partial, for future expansion.
 * Falls back to es-ES for missing keys.
 */
export const enUS: TranslationResource = {
  'app.title': 'AVHOS',
  'app.subtitle': 'AI-native programming environment',

  'activity.explorer': 'Explorer',
  'activity.chat': 'Agent',
  'activity.planner': 'Planner',
  'activity.memory': 'Memory',
  'activity.skills': 'Skills',
  'activity.mcp': 'MCP',
  'activity.models': 'Models',
  'activity.logs': 'Logs',
  'activity.settings': 'Settings',

  'palette.placeholder': 'Type a command or search...',
  'palette.noResults': 'No results',

  'explorer.title': 'Workspace Explorer',
  'explorer.empty': 'No projects open',

  'editor.empty': 'No files open',
  'editor.empty.hint': 'Open a file from the explorer or use the command palette',

  'chat.title': 'Agent',
  'chat.placeholder': 'Type your message...',
  'chat.send': 'Send',
  'chat.empty': 'No active session. Create a new one to start.',

  'planner.title': 'Task Planner',
  'planner.empty': 'No tasks. The agent will create tasks as needed.',

  'memory.title': 'System Memory',
  'memory.empty': 'No memory entries recorded.',

  'skills.title': 'Skills',
  'skills.empty': 'No skills registered.',

  'mcp.title': 'MCP Servers',
  'mcp.empty': 'No MCP servers registered.',

  'models.title': 'Model Management',
  'models.empty': 'No model providers configured.',

  'logs.title': 'Logs & Traces',
  'logs.empty': 'No events logged.',

  'settings.title': 'Settings',

  'activity.title': 'Activity',
  'activity.empty': 'No activity recorded',
  'terminal.title': 'Terminal',
  'terminal.notAvailable': 'Terminal not available',
  'terminal.notAvailableDesc': 'The integrated terminal requires PTY system integration. Not yet implemented.',

  'status.ready': 'Ready',

  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.save': 'Save',
  'common.close': 'Close',
  'common.refresh': 'Refresh',
  'common.search': 'Search',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.none': 'None',
  'common.unknown': 'Unknown',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.add': 'Add',
  'common.remove': 'Remove',
  'common.enable': 'Enable',
  'common.disable': 'Disable',
  'common.name': 'Name',
  'common.description': 'Description',
  'common.status': 'Status',
  'common.type': 'Type',
  'common.createdAt': 'Created',
  'common.updatedAt': 'Updated',
  'common.actions': 'Actions',
};
