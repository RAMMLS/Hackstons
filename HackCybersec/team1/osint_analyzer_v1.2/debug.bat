@echo off
echo 🐛 Режим отладки OSINT Analyzer

echo 🔧 Остановка старых контейнеров...
docker stop osint-app 2>nul
docker rm osint-app 2>nul

echo 🧹 Очистка образов...
docker rmi osint-analyzer 2>nul

echo 🔨 Сборка нового образа...
docker build -t osint-analyzer .

echo 🚀 Запуск в интерактивном режиме...
docker run -it -p 5000:5000 --name osint-app osint-analyzer

pause
