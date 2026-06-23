import { useState } from 'react';
import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader } from '@avhos/ui';
import { detectOllama } from '../../services/ollama-service.js';

export function SettingsPanel() {
  const { t } = useTranslation();
  const { theme, themeId, setThemeId, fontScale, setFontScale } = useTheme();
  const { ollamaUrl, setOllamaUrl, ollamaStatus } = useAppStore();
  const [urlInput, setUrlInput] = useState(ollamaUrl);

  const handleApplyUrl = () => {
    setOllamaUrl(urlInput.trim());
    detectOllama();
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--font-sm)',
    color: theme.colors.textSecondary,
    fontWeight: 600,
    marginBottom: '4px',
  };

  const descStyle: React.CSSProperties = {
    fontSize: 'var(--font-xs)',
    color: theme.colors.textMuted,
    marginBottom: '8px',
  };

  const inputStyle: React.CSSProperties = {
    background: theme.colors.bgTertiary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '4px',
    padding: '6px 10px',
    color: theme.colors.textPrimary,
    fontSize: 'var(--font-sm)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const sectionStyle: React.CSSProperties = {
    padding: '12px',
    background: theme.colors.bgTertiary,
    borderRadius: '6px',
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  return (
    <Panel>
      <PanelHeader title={t('settings.title')} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'auto' }}>

        <div style={sectionStyle}>
          <div style={labelStyle}>Tema</div>
          <div style={descStyle}>Cambia entre tema oscuro y claro. Se aplica inmediatamente.</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setThemeId('dark')}
              style={{
                padding: '6px 16px',
                borderRadius: '4px',
                border: `1px solid ${themeId === 'dark' ? theme.colors.accent : theme.colors.border}`,
                background: themeId === 'dark' ? theme.colors.accent + '22' : 'transparent',
                color: themeId === 'dark' ? theme.colors.accent : theme.colors.textSecondary,
                cursor: 'pointer',
                fontSize: 'var(--font-sm)',
              }}
            >
              Oscuro
            </button>
            <button
              onClick={() => setThemeId('light')}
              style={{
                padding: '6px 16px',
                borderRadius: '4px',
                border: `1px solid ${themeId === 'light' ? theme.colors.accent : theme.colors.border}`,
                background: themeId === 'light' ? theme.colors.accent + '22' : 'transparent',
                color: themeId === 'light' ? theme.colors.accent : theme.colors.textSecondary,
                cursor: 'pointer',
                fontSize: 'var(--font-sm)',
              }}
            >
              Claro
            </button>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={labelStyle}>Tamaño de fuente</div>
          <div style={descStyle}>Escala aplicada a toda la UI. Se aplica inmediatamente.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setFontScale(Math.max(0.8, fontScale - 0.1))}
              style={{
                width: '32px', height: '32px',
                borderRadius: '4px',
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.bgSecondary,
                color: theme.colors.textPrimary,
                cursor: 'pointer',
                fontSize: 'var(--font-base)',
              }}
            >−</button>
            <span style={{ fontSize: 'var(--font-sm)', color: theme.colors.textPrimary, minWidth: '48px', textAlign: 'center' }}>
              {Math.round(fontScale * 100)}%
            </span>
            <button
              onClick={() => setFontScale(Math.min(1.5, fontScale + 0.1))}
              style={{
                width: '32px', height: '32px',
                borderRadius: '4px',
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.bgSecondary,
                color: theme.colors.textPrimary,
                cursor: 'pointer',
                fontSize: 'var(--font-base)',
              }}
            >+</button>
            <button
              onClick={() => setFontScale(1)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: `1px solid ${theme.colors.border}`,
                background: 'transparent',
                color: theme.colors.textMuted,
                cursor: 'pointer',
                fontSize: 'var(--font-xs)',
                marginLeft: '4px',
              }}
            >Restablecer</button>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={labelStyle}>URL de Ollama</div>
          <div style={descStyle}>
            Estado actual:{' '}
            <span style={{
              color: ollamaStatus === 'online' ? theme.colors.success
                : ollamaStatus === 'offline' ? theme.colors.danger
                : theme.colors.warning,
              fontWeight: 600,
            }}>
              {ollamaStatus === 'online' ? 'conectado' : ollamaStatus === 'offline' ? 'desconectado' : 'comprobando...'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyUrl(); }}
              placeholder="http://localhost:11434"
              style={inputStyle}
            />
            <button
              onClick={handleApplyUrl}
              style={{
                padding: '6px 16px',
                borderRadius: '4px',
                border: 'none',
                background: theme.colors.accent,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 'var(--font-sm)',
                whiteSpace: 'nowrap',
              }}
            >
              Aplicar
            </button>
          </div>
        </div>

        <div style={{ fontSize: 'var(--font-xs)', color: theme.colors.textMuted, fontStyle: 'italic' }}>
          Los ajustes se guardan en el navegador y persisten entre reinicios.
        </div>
      </div>
    </Panel>
  );
}
