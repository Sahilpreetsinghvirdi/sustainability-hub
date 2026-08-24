Option Explicit
Dim sh
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "D:\Visual Studio Files\Sustainability"

Function PortUp(port)
  Dim http
  On Error Resume Next
  Err.Clear
  Set http = CreateObject("MSXML2.XMLHTTP")
  http.Open "GET", "http://127.0.0.1:" & port & "/", False
  http.Send
  PortUp = (Err.Number = 0 And http.Status > 0)
  On Error Goto 0
End Function

' 1) Start backend API silently if not running
If Not PortUp(8000) Then
  sh.Run "cmd /c cd /d ""D:\Visual Studio Files\Sustainability\backend"" && .venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000", 0, False
End If
Dim t : t = 0
Do While Not PortUp(8000) And t < 40
  WScript.Sleep 500
  t = t + 1
Loop

' 2) Start the app frontend silently if not running
If Not PortUp(1420) Then
  sh.Run "cmd /c cd /d ""D:\Visual Studio Files\Sustainability\desktop"" && npm run dev", 0, False
End If
t = 0
Do While Not PortUp(1420) And t < 60
  WScript.Sleep 500
  t = t + 1
Loop

' 3) Launch the native desktop app (real .exe window)
sh.Run """D:\Visual Studio Files\Sustainability\desktop\src-tauri\target\release\sustainability-hub-desktop.exe""", 1, False
