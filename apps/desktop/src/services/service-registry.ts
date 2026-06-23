import type { WorkspaceService } from './workspace-service.js';

/**
 * Registro de servicios compartido para componentes que necesitan
 * acceder al WorkspaceService sin pasar por props.
 * Se inicializa en App.tsx durante el arranque.
 */
let _workspaceService: WorkspaceService | null = null;

export function setWorkspaceService(service: WorkspaceService): void {
  _workspaceService = service;
}

export function getWorkspaceService(): WorkspaceService {
  if (!_workspaceService) {
    throw new Error('WorkspaceService no inicializado');
  }
  return _workspaceService;
}
