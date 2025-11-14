@echo off
echo 🔨 Сборка OSINT Analyzer...
docker build -t osint-analyzer .

echo 🚀 Запуск контейнера...
docker run -d -p 5000:5000 --name osint-app osint-analyzer

echo ⏳ Ожидание запуска...
timeout /t 5 /nobreak

echo 📋 Проверка логов...
docker logs osint-app

echo.
echo ✅ Готово! Приложение доступно по адресу:
echo 🌐 http://localhost:5000
echo.
pause
