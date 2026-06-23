import { useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/app-store.js';
import type { ChatMsg } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, ScrollList, Badge, IconButton } from '@avhos/ui';
import { streamChat } from '../../services/ollama-service.js';
import { getWorkspaceService } from '../../services/service-registry.js';

function findMentionedFiles(message: string, inventory: string[]): string[] {
  const lower = message.toLowerCase();
  const matches: string[] = [];
  for (const filePath of inventory) {
    const fileName = filePath.split(/[\\/]/).pop() ?? filePath;
    const lowerName = fileName.toLowerCase();
    const lowerPath = filePath.toLowerCase();
    if (lower.includes(lowerName) || lower.includes(lowerPath)) {
      matches.push(filePath);
    }
  }
  return matches.slice(0, 5);
}

export function ChatPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const {
    ollamaStatus, activeModel, ollamaModels, workspaceRoot,
    activeTabId, openTabs, tabContents, projectInventory, inventoryLoading,
    chatMessages: messages, chatInput: input, chatLoading: loading,
    setChatInput: setInput, setChatLoading: setLoading,
    setChatMessages, updateChatMessage, clearChatMessages,
  } = useAppStore();
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeTab = openTabs.find((tab) => tab.id === activeTabId);
  const projectName = workspaceRoot
    ? workspaceRoot.split(/[\\/]/).pop()
    : null;

  const modelGone = ollamaStatus === 'online' && activeModel && !ollamaModels.includes(activeModel);
  const canChat = ollamaStatus === 'online' && !!activeModel && !modelGone && !loading;

  const openFileList = openTabs.map((tab) => tab.filePath);

  const contextLabel = useMemo(() => {
    if (inventoryLoading) return 'Contexto: escaneando proyecto...';
    const parts: string[] = [];
    parts.push(`${projectInventory.length} archivos del proyecto`);
    if (openFileList.length > 0) parts.push(`${openFileList.length} abiertos`);
    if (activeTab) parts.push('archivo activo');
    return `Contexto: ${parts.join(' + ')}`;
  }, [projectInventory.length, inventoryLoading, openFileList.length, activeTab]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setLoading(false);
  };

  const handleClear = () => {
    clearChatMessages();
  };

  const buildSystemPrompt = async (userMessage: string): Promise<string> => {
    if (!workspaceRoot) return '';
    const sections: string[] = [];

    sections.push(`Proyecto: ${projectName} (${workspaceRoot})`);

    if (projectInventory.length > 0) {
      const fileList = projectInventory.slice(0, 200).join('\n');
      const truncatedNote = projectInventory.length > 200 ? `\n... (${projectInventory.length - 200} archivos más no listados)` : '';
      sections.push(`Inventario real del proyecto (${projectInventory.length} archivos, excluyendo node_modules, dist, .git, target):\n${fileList}${truncatedNote}`);
    } else if (inventoryLoading) {
      sections.push('Inventario del proyecto: escaneando...');
    } else {
      sections.push('Inventario del proyecto: (vacío o no disponible)');
    }

    if (openFileList.length > 0) {
      sections.push(`Archivos abiertos en pestañas:\n${openFileList.join('\n')}`);
    }

    if (activeTab) {
      const tabContent = tabContents[activeTab.id];
      const fileContent = tabContent?.content ?? '';
      const truncated = fileContent.length > 8000
        ? fileContent.slice(0, 8000) + '\n... (truncado)'
        : fileContent;
      const ext = activeTab.filePath.split('.').pop() ?? '';
      sections.push(`Archivo activo: ${activeTab.filePath} (${ext || 'sin extensión'})\n\nContenido:\n\`\`\`\n${truncated}\n\`\`\``);
    } else {
      sections.push('Archivo activo: ninguno');
    }

    // Detectar archivos mencionados por el usuario y leer su contenido
    const mentionedFiles = findMentionedFiles(userMessage, projectInventory);
    if (mentionedFiles.length > 0) {
      const ws = getWorkspaceService();
      const isWindows = workspaceRoot.includes('\\');
      const sep = isWindows ? '\\' : '/';
      const fileContents: string[] = [];
      let readCount = 0;
      for (const filePath of mentionedFiles) {
        if (readCount >= 3) break;
        // Saltar si ya es el archivo activo (ya está incluido)
        if (activeTab && activeTab.filePath === filePath) continue;
        const fullPath = `${workspaceRoot}${sep}${filePath.replace(/\//g, sep)}`;
        try {
          const result = await ws.loadFileContent(fullPath);
          if (!result.error && result.content) {
            const truncatedContent = result.content.length > 4000
              ? result.content.slice(0, 4000) + '\n... (truncado)'
              : result.content;
            fileContents.push(`### ${filePath}\n\`\`\`\n${truncatedContent}\n\`\`\``);
            readCount++;
          }
        } catch {
          // ignore read errors
        }
      }
      if (fileContents.length > 0) {
        sections.push(`Archivos adicionales mencionados (${fileContents.length}):\n${fileContents.join('\n\n')}`);
      }
    }

    return sections.join('\n\n');
  };

  const handleSend = async () => {
    if (!input.trim() || !activeModel || !canChat) return;
    const content = input.trim();
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: 'user', content };
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMsg = { id: assistantId, role: 'assistant', content: '' };
    setChatMessages([...messages, userMsg, assistantMsg]);

    const history: { role: 'system' | 'user' | 'assistant'; content: string }[] =
      [...messages, userMsg].map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const systemPrompt = await buildSystemPrompt(content);
    if (systemPrompt) {
      history.unshift({
        role: 'system',
        content: systemPrompt,
      });
    }

    try {
      await streamChat(activeModel, history, (delta) => {
        updateChatMessage(assistantId, (m) => ({ ...m, content: m.content + delta }));
      }, controller.signal);
      useAppStore.getState().pushActivity('editor', 'info', `Chat: respuesta de ${activeModel}`);
    } catch (err) {
      if (controller.signal.aborted) {
        updateChatMessage(assistantId, (m) =>
          m.content === '' ? { ...m, role: 'error', content: 'Generación cancelada' } : m,
        );
      } else {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        updateChatMessage(assistantId, (m) => ({ ...m, role: 'error', content: `Error: ${msg}` }));
        useAppStore.getState().pushActivity('editor', 'error', `Chat: ${msg}`);
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  return (
    <Panel>
      <PanelHeader
        title={t('chat.title')}
        actions={
          <>
            {activeModel && !modelGone && (
              <Badge color={theme.colors.accent}>{activeModel}</Badge>
            )}
            {messages.length > 0 && !loading && (
              <IconButton title="Limpiar conversación" onClick={handleClear}>
                ✕
              </IconButton>
            )}
          </>
        }
      />

      {ollamaStatus !== 'online' && (
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: 'var(--font-base)', color: theme.colors.textPrimary, fontWeight: 600 }}>
            Chat no disponible
          </div>
          <div style={{ fontSize: 'var(--font-sm)', color: theme.colors.textMuted, lineHeight: 1.6 }}>
            {ollamaStatus === 'offline'
              ? 'Ollama no está activo. Inicia Ollama y pulsa ↻ en el panel Models.'
              : 'Comprobando Ollama...'}
          </div>
          {projectName && (
            <div style={{ fontSize: 'var(--font-xs)', color: theme.colors.textMuted }}>
              Proyecto: {projectName}
            </div>
          )}
        </div>
      )}

      {ollamaStatus === 'online' && !activeModel && (
        <div style={{ padding: '24px 16px' }}>
          <div style={{ fontSize: 'var(--font-sm)', color: theme.colors.textMuted, lineHeight: 1.6 }}>
            Ollama está activo pero no hay modelos instalados.
            Ejecuta <span style={{ color: theme.colors.accent }}>ollama pull llama3.2</span> en una terminal.
          </div>
        </div>
      )}

      {modelGone && (
        <div style={{ padding: '24px 16px' }}>
          <div style={{ fontSize: 'var(--font-sm)', color: theme.colors.warning, lineHeight: 1.6, marginBottom: '8px' }}>
            El modelo «{activeModel}» ya no está disponible en Ollama.
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: theme.colors.textMuted }}>
            Selecciona otro modelo en el panel Models para continuar.
          </div>
        </div>
      )}

      {ollamaStatus === 'online' && activeModel && !modelGone && (
        <>
          <div style={{
            padding: '4px 12px',
            borderBottom: `1px solid ${theme.colors.border}`,
            fontSize: 'var(--font-xs)',
            color: theme.colors.textMuted,
            background: theme.colors.bgSecondary,
          }}>
            {contextLabel}
          </div>
          <ScrollList>
            <div ref={scrollRef} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.length === 0 && (
                <div style={{ color: theme.colors.textMuted, textAlign: 'center', padding: '24px', fontSize: 'var(--font-sm)' }}>
                  Escribe un mensaje para chatear con {activeModel}
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: msg.role === 'user'
                        ? theme.colors.accent + '22'
                        : msg.role === 'error'
                          ? theme.colors.danger + '22'
                          : theme.colors.bgTertiary,
                      color: msg.role === 'error' ? theme.colors.danger : theme.colors.textPrimary,
                      fontSize: 'var(--font-base)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.content || (loading && msg.role === 'assistant' ? '...' : '')}
                  </div>
                </div>
              ))}
            </div>
          </ScrollList>
          <div style={{ padding: '8px', borderTop: `1px solid ${theme.colors.border}`, display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={loading ? 'Generando...' : `Mensaje a ${activeModel}`}
              disabled={loading}
              style={{
                flex: 1,
                background: theme.colors.bgTertiary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '4px',
                padding: '8px',
                color: theme.colors.textPrimary,
                fontSize: 'var(--font-base)',
                outline: 'none',
                opacity: loading ? 0.6 : 1,
              }}
            />
            {loading ? (
              <button
                onClick={handleCancel}
                style={{
                  background: theme.colors.danger,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: 'var(--font-base)',
                }}
              >
                ⏹
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!canChat}
                style={{
                  background: canChat ? theme.colors.accent : theme.colors.bgTertiary,
                  color: canChat ? '#fff' : theme.colors.textMuted,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: canChat ? 'pointer' : 'not-allowed',
                  fontSize: 'var(--font-base)',
                }}
              >
                {t('chat.send')}
              </button>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}
