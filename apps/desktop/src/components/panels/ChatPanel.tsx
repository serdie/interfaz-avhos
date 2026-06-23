import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, ScrollList, Badge } from '@avhos/ui';
import { streamChat } from '../../services/ollama-service.js';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
}

export function ChatPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { ollamaStatus, activeModel, workspaceRoot, activeTabId, openTabs } = useAppStore();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeTab = openTabs.find((tab) => tab.id === activeTabId);
  const projectName = workspaceRoot
    ? workspaceRoot.split(/[\\/]/).pop()
    : null;

  const canChat = ollamaStatus === 'online' && !!activeModel && !loading;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeModel || !canChat) return;
    const content = input.trim();
    setInput('');
    setLoading(true);

    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: 'user', content };
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMsg = { id: assistantId, role: 'assistant', content: '' };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const history: { role: 'system' | 'user' | 'assistant'; content: string }[] =
      [...messages, userMsg].map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    if (activeTab) {
      history.unshift({
        role: 'system',
        content: `Estás editando el archivo ${activeTab.filePath} del proyecto ${projectName}.`,
      });
    }

    try {
      await streamChat(activeModel, history, (delta) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + delta } : m,
          ),
        );
      });
      useAppStore.getState().pushActivity('editor', 'info', `Chat: respuesta de ${activeModel}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, role: 'error', content: `Error: ${msg}` }
            : m,
        ),
      );
      useAppStore.getState().pushActivity('editor', 'error', `Chat: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel>
      <PanelHeader
        title={t('chat.title')}
        actions={
          activeModel ? (
            <Badge color={theme.colors.accent}>{activeModel}</Badge>
          ) : undefined
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

      {ollamaStatus === 'online' && activeModel && (
        <>
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
          </div>
        </>
      )}
    </Panel>
  );
}
