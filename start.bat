@echo off
echo ====================================
echo    剧本 AI 评级系统 - 启动中...
echo ====================================

:: 启动后端代理
echo [1/2] 启动后端代理服务器...
start "Proxy Server" cmd /k "cd /d %~dp0proxy && npm run dev"

:: 等待 2 秒
timeout /t 2 /nobreak > nul

:: 启动前端
echo [2/2] 启动前端开发服务器...
start "Frontend Dev" cmd /k "cd /d %~dp0frontend && npm run dev"

echo ====================================
echo    启动完成！
echo    前端: http://localhost:3002
echo    后端: http://localhost:3003
echo ====================================
pause
