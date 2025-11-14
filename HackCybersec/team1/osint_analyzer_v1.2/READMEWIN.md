# Ручной запуск через PowerShell:

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


***Проблема: "Docker Desktop not running"
***powershell
'''
# Запустите Docker Desktop через меню Пуск
# Или через PowerShell:
Start-Process "Docker Desktop"
'''

***проблема: Порт 5000 занят
***powershell

'''
# Найдите процесс, использующий порт
netstat -ano | findstr :5000

# Или используйте другой порт
docker run -d -p 8080:5000 --name osint-app osint-analyzer
# Тогда откройте http://localhost:8080
'''

***Проблема: Ошибки при сборке
***powershell
'''
# Очистите всё и пересоберите
docker stop osint-app
docker rm osint-app
docker rmi osint-analyzer
docker build --no-cache -t osint-analyzer .
'''


# Запуск 
* start.bat 
* debug.bat 

# Все логи
docker logs osint-app

# Логи в реальном времени
docker logs -f osint-app

# Последние 10 строк
docker logs --tail 10 osint-app
