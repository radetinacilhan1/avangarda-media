@echo off
setlocal
echo.
echo [03] Full reset (DOWN -v) and rebuild (UP --build)...
echo.
docker compose down -v
docker compose up --build
