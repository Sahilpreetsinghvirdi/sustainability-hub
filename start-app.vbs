Option Explicit
Dim sh
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "D:\Visual Studio Files\Sustainability"

Function PortUp(port)
  Dim oExec, found
  found = False
  On Error Resume Next
  Set oExec = sh.Exec("cmd /c netstat -ano | findstr :" & port & " | findstr LISTENING")
  If Err.Number = 0 Then
    If Not oExec.StdOut.AtEndOfStream Then found = True
  End If
  On Error Goto 0
  PortUp = found
End Function

' 1) Start backend engine silently (harmless if already running)
If Not PortUp(8000) Then
  sh.Run "cmd /c cd /d ""D:\Visual Studio Files\Sustainability\backend"" && .venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000", 0, False
End If

' 2) Start the app frontend silently (harmless if already running)
If Not PortUp(1420) Then
  sh.Run "cmd /c cd /d ""D:\Visual Studio Files\Sustainability\desktop"" && npm run dev", 0, False
End If

' 3) Wait until frontend answers (max ~30s), checking once per second
Dim waited
waited = 0
Do While Not PortUp(1420) And waited < 30
  WScript.Sleep 1000
  waited = waited + 1
Loop

' brief grace moment for the page to be fully served
WScript.Sleep 1500

' 4) Launch the native desktop app (.exe window)
sh.Run """D:\Visual Studio Files\Sustainability\desktop\src-tauri\target\release\sustainability-hub-desktop.exe""", 1, False
