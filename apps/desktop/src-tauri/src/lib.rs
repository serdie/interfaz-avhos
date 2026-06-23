// AVHOS desktop — Tauri backend entry point
// SCAFFOLDED: SQLite persistence and shell execution will be wired here.

use std::env;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            ping,
            get_workspace_root,
        ])
        .run(tauri::generate_context!("tauri.conf.json"))
        .expect("error while running tauri application");
}

/// Simple health check command.
#[tauri::command]
fn ping() -> String {
    "AVHOS backend activo".to_string()
}

/// Devuelve la ruta raíz del workspace (directorio de trabajo actual).
/// En el futuro, esto podría venir de la configuración del usuario
/// o de un selector de directorio.
#[tauri::command]
fn get_workspace_root() -> String {
    env::current_dir()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|_| ".".to_string())
}
