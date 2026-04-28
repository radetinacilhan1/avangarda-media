@echo off
setlocal
echo.
echo [02] Installing CMS dependencies (prevents Strapi admin prompt)...
echo.
docker compose run --rm cms sh -lc "npm install"
echo.
echo Done.
pause
