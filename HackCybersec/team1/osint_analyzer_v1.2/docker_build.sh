#!/bin/bash
# debug_build.sh

echo "🧹 Очистка предыдущих контейнеров..."
docker stop osint-app 2>/dev/null
docker rm osint-app 2>/dev/null

echo "🔨 Сборка образа..."
docker build -t osint-analyzer .

echo "🚀 Запуск контейнера..."
docker run -d -p 5000:5000 --name osint-app osint-analyzer

echo "📋 Проверка логов..."
sleep 3
docker logs osint-app

echo "✅ Проверка работы..."
curl -s http://localhost:5000 | head -n 5
