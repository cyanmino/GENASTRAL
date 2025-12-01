@echo off
cd /d "%~dp0"
npm install
start "" /min cmd /c "npm run preview"
start "" http://localhost:4173
