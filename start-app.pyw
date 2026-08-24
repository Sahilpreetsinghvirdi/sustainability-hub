import ctypes
import os
import socket
import time

ROOT = r"D:\Visual Studio Files\Sustainability"
EXE = os.path.join(ROOT, "desktop", "src-tauri", "target", "release", "sustainability-hub-desktop.exe")
LOG = os.path.join(ROOT, "start-app.log")

SW_HIDE = 0
SW_SHOWNORMAL = 1


def log(msg: str) -> None:
    try:
        with open(LOG, "a", encoding="utf-8") as f:
            f.write(f"{time.strftime('%H:%M:%S')} {msg}\n")
    except OSError:
        pass


def port_up(port: int, host: str = "127.0.0.1") -> bool:
    for h in (host, "::1"):
        try:
            with socket.socket(socket.AF_INET6 if ":" in h else socket.AF_INET,
                               socket.SOCK_STREAM) as s:
                s.settimeout(0.3)
                if s.connect_ex((h, port)) == 0:
                    return True
        except OSError:
            continue
    return False


def shell_launch(file_: str, params: str = "", show: int = SW_HIDE, cwd: str | None = None) -> bool:
    """Launch via the Windows Shell (same mechanism as double-clicking).
    Never inherits handles, never shows a console when show=SW_HIDE."""
    res = ctypes.windll.shell32.ShellExecuteW(None, None, file_, params, cwd, show)
    ok = res > 32
    log(f"shell_launch {file_} {params} -> {res}")
    return ok


log("=== launcher started ===")

if not port_up(8000):
    log("starting backend")
    shell_launch(
        "cmd.exe",
        '/c "cd /d ' + os.path.join(ROOT, "backend") + ' && .venv\\Scripts\\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"',
        SW_HIDE,
        os.path.join(ROOT, "backend"),
    )
else:
    log("backend already up")

if not port_up(1420):
    log("starting frontend")
    shell_launch(
        "cmd.exe",
        '/c "cd /d ' + os.path.join(ROOT, "desktop") + ' && npm run dev"',
        SW_HIDE,
        os.path.join(ROOT, "desktop"),
    )
else:
    log("frontend already up")

for _ in range(60):
    if port_up(1420):
        break
    time.sleep(0.5)

time.sleep(1.5)

if os.path.exists(EXE):
    shell_launch(EXE, "", SW_SHOWNORMAL)
else:
    log("exe missing!")
