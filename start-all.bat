@echo off
title IMovies One-Click Launcher
echo ===================================================
echo     🎬 IMovies Cinema Ticket Booking System
echo ===================================================
echo.
echo [1/3] Starting Backend API Server (Port 5000)...
start "IMovies Backend Server" cmd /k "cd server && npm.cmd start"

echo [2/3] Starting Frontend Web Client (Port 5173)...
start "IMovies Frontend Client" cmd /k "cd client && npm.cmd run dev"

echo [3/3] Opening your browser...
start http://localhost:5173

echo.
echo ===================================================
echo   IMovies is now running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ===================================================
echo.
