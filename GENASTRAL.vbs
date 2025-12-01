Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "C:\Users\cyan\Documents\GitHub\GENASTRAL"
' Quita la siguiente línea si ya tienes dependencias instaladas
sh.Run "cmd /c npm install", 0, False
sh.Run "cmd /c npm run preview", 0, False  ' usa el puerto 4173 por defecto de preview
sh.Run "http://localhost:4173", 0, False
Set sh = Nothing
