#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Sustainability Hub.", name)
}

#[tauri::command]
async fn install_update(bytes: Vec<u8>) -> Result<String, String> {
    let temp = std::env::temp_dir().join("ELARA-update.msi");
    std::fs::write(&temp, bytes).map_err(|e| format!("Failed to write installer: {e}"))?;
    std::process::Command::new("msiexec")
        .arg("/i")
        .arg(&temp)
        .spawn()
        .map_err(|e| format!("Failed to launch installer: {e}"))?;
    Ok(temp.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, install_update])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
