@echo off
setlocal
echo.
echo [01] Fixing Strapi /app/public inside container...
echo.
docker compose run --rm cms sh -lc "mkdir -p /app/public && chmod 755 /app/public && echo ok > /app/public/.keep && ls -la /app/public"
echo.
echo Done.
pause
