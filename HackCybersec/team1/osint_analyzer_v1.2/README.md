#Update requirements.txt - обновил файл

# Собираем образ
docker build -t osint-analyzer .

# Запускаем контейнер
docker run -d -p 5000:5000 --name osint-app osint-analyzer

# Проверяем логи
docker logs osint-app

# Проверяем статус
docker ps

# Тестируем приложение
curl http://localhost:5000


# Даем права на выполнение
chmod +x debug_build.sh

# Запускаем отладочную сборку
./debug_build.sh
