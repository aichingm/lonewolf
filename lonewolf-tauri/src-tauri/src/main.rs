// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use faccess::{AccessMode, PathExt};
use std::env;
use std::fs::read;
use std::path::Path;
use tauri::http;
use tauri::PhysicalSize;
use tauri::Size;
use tauri::Manager;


use webbrowser;

#[tauri::command]
fn mime(path: &str) -> String {
    let mime_res = infer::get_from_path(path);

    let mime_opt = match mime_res {
        Ok(v) => v,
        Err(_e) => return "application/octet-stream".to_string(),
    };

    if mime_opt.is_none() {
        return "application/octet-stream".to_string();
    }

    return mime_opt.unwrap().mime_type().to_string();
}

#[tauri::command]
fn open_file(uri: &str) {
    let absolute_origin = "fs://absolute.local";
    let relative_origin = "fs://relative.local/";

    if uri.starts_with(absolute_origin) {
        let path_opt = uri.get(absolute_origin.len()..uri.len());
        if path_opt.is_some() {
            println!("open_file (absolute) {} ...", path_opt.unwrap());
            opener::open(Path::new(path_opt.unwrap())).unwrap_or(());
        }
    } else if uri.starts_with(relative_origin) {
        let path_opt = uri.get(relative_origin.len()..uri.len());
        if path_opt.is_some() {
            println!("open_file (relative) {} ...", path_opt.unwrap());
            opener::open(Path::new(path_opt.unwrap())).unwrap_or(());
        } else {
            println!("[failed] open_file (relative) {} ...", path_opt.unwrap());
        }
    } else if uri.starts_with("data:") {
        if webbrowser::open(uri).is_ok() {
            println!("open_file (data url) [webbrowser] ...");
        } else {
            println!("[failed] open_file (data url) [webbrowser] ...");
        }
    } else if uri.starts_with("http") {
        let path = Path::new(uri);
        if opener::open(path).is_ok() {
            println!("open_file (http/s) {} ...", uri);
        } else {
            println!("[failed] open_file (http/s) {} ...", uri);
        }
    } else {
        println!("[failed] open_file {} failed", uri);
    }
}

#[tauri::command]
fn sync_cwd_to(path: &str) {
    let p = Path::new(path);
    match p.parent() {
        Some(parent) => {
            env::set_current_dir(&parent).unwrap_or(());
            Some(parent)
        }
        None => None,
    };
}
#[tauri::command]
fn get_cwd() -> Result<String, String> {
    let rpath = env::current_dir();

    if rpath.is_ok() {
        let path = rpath.unwrap();
        let pstr = path.to_str();
        if pstr.is_some() {
            return Ok(pstr.unwrap().to_string());
        }
    }
    return Err("ERROR".to_string());
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            mime,
            open_file,
            sync_cwd_to,
            get_cwd
        ])
        .register_uri_scheme_protocol("fs", move |_app, request| {
            let absolute_origin = "absolute.local";
            let relative_origin = "relative.local";

            let bad_request = http::Response::builder().status(400).body(Vec::new()).unwrap();

            let forbidden = http::Response::builder().status(403).body(Vec::new()).unwrap();

            let not_found = http::Response::builder().status(404).body(Vec::new()).unwrap();

            let method_not_alowed = http::Response::builder().status(405).body(Vec::new()).unwrap();

            let server_error = http::Response::builder().status(500).body(Vec::new()).unwrap();

            if request.method() != "GET" {
                return method_not_alowed;
            }

            let uri = request.uri();

            if !(uri.host() == Some(absolute_origin) || uri.host() == Some(relative_origin)) {
                return bad_request;
            }

            let path = if uri.host() == Some(absolute_origin) {
                Path::new(uri.path())
            } else {
                Path::new(&uri.path()[1..])
            };

            let cwd = &env::current_dir().unwrap();
            let new_absolute_path = Path::new(cwd).join(path);

            let absolute_path = if path.is_absolute() {
                path
            } else {
                &new_absolute_path
            };

            if !absolute_path.is_file() {
                return not_found;
            }

            if !absolute_path.access(AccessMode::READ).is_ok() {
                return forbidden;
            }

            let path_str = path.to_str().unwrap_or("");

            let local_file = if let Ok(data) = read(absolute_path) {
                http::Response::builder()
                    .header("Content-Type", &mime(path_str))
                    .body(data).unwrap()
            } else {
                return server_error;
            };

            local_file
        })
        .setup(|app| {
            let main_window = app.get_webview_window("main").unwrap();
            main_window
                .set_min_size(Some(Size::Physical(PhysicalSize {
                    width: 1000,
                    height: 600,
                })))
                .unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
