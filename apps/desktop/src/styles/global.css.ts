/**
 * Global CSS — injected as a style tag at runtime.
 * Uses CSS variables from the theme system.
 * Dark-first, IDE-style, high density, no gimmicks.
 */
export const globalCSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #root { height: 100%; width: 100%; overflow: hidden; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 13px;
  background: var(--bg-primary, #0d1117);
  color: var(--text-primary, #e6edf3);
  -webkit-font-smoothing: antialiased;
  user-select: none;
}
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border, #30363d); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted, #6e7681); }
input, textarea { user-select: text; }
button { font-family: inherit; }
.avhos-panel { display: flex; flex-direction: column; height: 100%; background: var(--bg-primary); }
.avhos-panel * { user-select: text; }
button, .avhos-panel-header, .avhos-activitybar { user-select: none; }
`;

const styleId = 'avhos-global-styles';

export function injectGlobalCSS() {
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = globalCSS;
  document.head.appendChild(style);
}
