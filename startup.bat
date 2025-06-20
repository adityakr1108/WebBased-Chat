@echo off
cd /d "%~dp0"
call pm2 start server.js --name "chat-ui"
