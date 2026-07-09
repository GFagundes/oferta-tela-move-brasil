@echo off
cd /d "C:\Meus Sites\oferta tela move brasil"

:: Verifica se o servidor já está rodando
netstat -an | findstr :3001 >nul 2>&1
if errorlevel 1 (
    echo Iniciando servidor...
    start /B node server.js
    timeout /t 3 /nobreak >nul
)

start http://localhost:3001/
echo Servidor rodando em http://localhost:3001
echo.
echo Feche esta janela ou pressione qualquer tecla para parar o servidor.
echo.
pause
taskkill /f /im node.exe >nul 2>&1