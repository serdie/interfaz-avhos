import { useState } from 'react';
import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, EmptyState, ScrollList, IconButton, Badge } from '@avhos/ui';
import { uuid, isoNow } from '@avhos/core';
import { getServices } from '../../services/container.js';

const STATUS_COLORS: Record<string, string> = {
  idle: '#6e7681',
  planning: '#d29922',
  executing: '#2f81f7',
  waiting_approval: '#d29922',
  completed: '#3fb950',
  error: '#f85149',
  cancelled: '#6e7681',
};

export function ChatPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { sessions, activeSessionId, setActiveSession, addMessage } = useAppStore();
  const [input, setInput] = useState('');

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleSend = async () => {
    if (!input.trim() || !activeSession) return;
    const content = input.trim();
    setInput('');

    // Add user message
    addMessage(activeSession.id, {
      id: uuid(crypto.randomUUID()),
      sessionId: activeSession.id,
      role: 'user',
      content,
      modelProfileId: null,
      toolCallId: null,
      metadata: {},
      createdAt: isoNow(),
    });

    // Try to get a response from the orchestrator
    try {
      const services = getServices();
      const provider = services.providerRegistry.getOrCreate({
        id: activeSession.modelProfileId ?? uuid(''),
        name: '',
        type: 'ollama',
        baseUrl: 'http://localhost:11434',
        apiKey: null,
        capabilities: ['chat'],
        enabled: true,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      });
      const response = await services.orchestrator.processMessage(activeSession, content, provider, 'placeholder');
      addMessage(activeSession.id, response);
    } catch {
      addMessage(activeSession.id, {
        id: uuid(crypto.randomUUID()),
        sessionId: activeSession.id,
        role: 'error',
        content: '[Error] No se pudo obtener respuesta del modelo. Verifica la configuración de proveedores.',
        modelProfileId: null,
        toolCallId: null,
        metadata: {},
        createdAt: isoNow(),
      });
    }
  };

  return (
    <Panel>
      <PanelHeader
        title={t('chat.title')}
        actions={<IconButton title={t('chat.newSession')}>+</IconButton>}
      />
      {sessions.length === 0 ? (
        <EmptyState message={t('chat.empty')} hint={t('chat.empty.hint')} />
      ) : (
        <>
          <div style={{ borderBottom: `1px solid ${theme.colors.border}`, padding: '4px 0' }}>
            <ScrollList>
              <div style={{ maxHeight: '120px' }}>
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setActiveSession(s.id)}
                    style={{
                      padding: '6px 12px',
                      cursor: 'pointer',
                      background: s.id === activeSessionId ? theme.colors.bgHover : 'transparent',
                      borderLeft: s.id === activeSessionId ? `2px solid ${theme.colors.accent}` : '2px solid transparent',
                      fontSize: 'var(--font-sm)',
                      color: s.id === activeSessionId ? theme.colors.textPrimary : theme.colors.textSecondary,
                    }}
                  >
                    {s.title}
                    <span style={{ marginLeft: '8px' }}>
                      <Badge color={STATUS_COLORS[s.status]}>{t(`chat.status.${s.status}`)}</Badge>
                    </span>
                  </div>
                ))}
              </div>
            </ScrollList>
          </div>
          <ScrollList>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeSession && activeSession.messages.length === 0 && (
                <div style={{ color: theme.colors.textMuted, textAlign: 'center', padding: '24px' }}>
                  {t('chat.empty')}
                </div>
              )}
              {activeSession?.messages.map((msg) => (
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
                    {msg.content}
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
              placeholder={t('chat.placeholder')}
              style={{
                flex: 1,
                background: theme.colors.bgTertiary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '4px',
                padding: '8px',
                color: theme.colors.textPrimary,
                fontSize: 'var(--font-base)',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              style={{
                background: theme.colors.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
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
