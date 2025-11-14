# OSINT Analyzer

Веб-приложение для анализа открытой разведывательной информации (OSINT).

## Быстрый старт

### Автоматический запуск

**Windows:**
- `start.bat` - обычный запуск
- `debug.bat` - запуск с отладкой

**Linux/Mac:**
```bash
chmod +x debug_build.sh
./debug_build.sh
```

### Ручной запуск через PowerShell

```powershell
# Перейдите в папку проекта
cd C:\path\to\osint-analyzer

# Соберите образ
docker build -t osint-analyzer .

# Запустите контейнер
docker run -d -p 5000:5000 --name osint-app osint-analyzer

# Проверьте статус
docker ps

# Откройте приложение в браузере
start http://localhost:5000
```

## Решение проблем

### Docker Desktop не запущен
```powershell
# Запустите Docker Desktop через меню Пуск
# Или через PowerShell:
Start-Process "Docker Desktop"
```

### Порт 5000 занят
```powershell
# Найдите процесс, использующий порт
netstat -ano | findstr :5000

# Или используйте другой порт
docker run -d -p 8080:5000 --name osint-app osint-analyzer
# Тогда откройте http://localhost:8080
```

### Ошибки при сборке
```powershell
# Очистите всё и пересоберите
docker stop osint-app
docker rm osint-app
docker rmi osint-analyzer
docker build --no-cache -t osint-analyzer .
```

## Управление контейнером

### Просмотр логов
```powershell
# Все логи
docker logs osint-app

# Логи в реальном времени
docker logs -f osint-app

# Последние 10 строк
docker logs --tail 10 osint-app
```

### Остановка и удаление
```powershell
# Остановить контейнер
docker stop osint-app

# Удалить контейнер
docker rm osint-app

# Удалить образ
docker rmi osint-analyzer
```

## Структура проекта
```
osint-analyzer/
├── app.py              # Основное приложение Flask
├── requirements.txt    # Зависимости Python
├── Dockerfile         # Конфигурация Docker
├── start.bat          # Скрипт запуска для Windows
├── debug.bat          # Скрипт отладки для Windows
├── debug_build.sh     # Скрипт сборки для Linux/Mac
├── templates/         # HTML шаблоны
└── static/           # CSS, JavaScript файлы
```

## Доступ к приложению
После успешного запуска приложение доступно по адресу: `http://localhost:5000`

## Примечание
Приложение предназначено для легитимного сбора и анализа открытой информации. Используйте в соответствии с законодательством.
