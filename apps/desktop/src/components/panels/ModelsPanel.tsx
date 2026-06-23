import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, ScrollList, Badge, IconButton } from '@avhos/ui';
import { detectOllama } from '../../services/ollama-service.js';

export function ModelsPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { ollamaStatus, ollamaModels, activeModel, setActiveModel } = useAppStore();

  const statusColor =
    ollamaStatus === 'online' ? '#3fb950' :
    ollamaStatus === 'offline' ? '#f85149' :
    '#d29922';

  const statusLabel =
    ollamaStatus === 'online' ? 'Online' :
    ollamaStatus === 'offline' ? 'Offline' :
    'Comprobando...';

  return (
    <Panel>
      <PanelHeader
        title={t('models.title')}
        actions={
          <IconButton title="Refrescar" onClick={() => detectOllama()}>
            ↻
          </IconButton>
        }
      />
      <div style={{ padding: '12px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: theme.colors.textPrimary }}>
          Ollama
        </span>
        <Badge color={statusColor}>{statusLabel}</Badge>
        <span style={{ fontSize: 'var(--font-xs)', color: theme.colors.textMuted, marginLeft: 'auto' }}>
          localhost:11434
        </span>
      </div>

      {ollamaStatus === 'offline' && (
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: 'var(--font-sm)', color: theme.colors.textMuted, lineHeight: 1.6 }}>
            Ollama no está disponible. Para usar modelos de IA locales:
          </div>
          <div style={{ padding: '12px', background: theme.colors.bgTertiary, borderRadius: '6px', border: `1px solid ${theme.colors.border}`, fontSize: 'var(--font-xs)', color: theme.colors.textSecondary, lineHeight: 1.6 }}>
            1. Instala Ollama desde <span style={{ color: theme.colors.accent }}>ollama.com</span><br />
            2. Ejecuta <span style={{ color: theme.colors.accent }}>ollama serve</span> en una terminal<br />
            3. Descarga un modelo: <span style={{ color: theme.colors.accent }}>ollama pull llama3.2</span><br />
            4. Pulsa ↻ para refrescar
          </div>
        </div>
      )}

      {ollamaStatus === 'online' && ollamaModels.length === 0 && (
        <div style={{ padding: '24px 16px' }}>
          <div style={{ fontSize: 'var(--font-sm)', color: theme.colors.textMuted, lineHeight: 1.6 }}>
            Ollama está activo pero no tiene modelos instalados.
            Ejecuta <span style={{ color: theme.colors.accent }}>ollama pull llama3.2</span> en una terminal.
          </div>
        </div>
      )}

      {ollamaStatus === 'online' && ollamaModels.length > 0 && (
        <ScrollList>
          {ollamaModels.map((model) => (
            <div
              key={model}
              onClick={() => setActiveModel(model)}
              style={{
                padding: '10px 12px',
                borderBottom: `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
                background: model === activeModel ? theme.colors.bgHover : 'transparent',
                borderLeft: model === activeModel ? `2px solid ${theme.colors.accent}` : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: theme.colors.textPrimary, fontSize: 'var(--font-base)' }}>
                {model}
              </span>
              {model === activeModel && (
                <Badge color={theme.colors.accent}>Activo</Badge>
              )}
            </div>
          ))}
        </ScrollList>
      )}
    </Panel>
  );
}
