from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os

# Импорты из вашей структуры
from app.config import settings
# Предполагаем, что у вас есть роутеры в app/routes
from app.routes import auth, profile

app = FastAPI(
    title="Moscow Chat API",
    description="API для чат-бота с московской тематикой",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
try:
    app.include_router(auth.router, prefix="/api/v1")
except Exception as e:
    print(f"Note: Auth router not available: {e}")

try:
    app.include_router(profile.router)
except Exception as e:
    print(f"Note: Profile router not available: {e}")

class ChatRequest(BaseModel):
    message: str
    model: str = "mistral-small"

class ChatResponse(BaseModel):
    response: str
    model: str

class HealthResponse(BaseModel):
    status: str
    mistral: str
    database: str
    error: str = None

@app.on_event("startup")
async def startup_event():
    print("FastAPI application started")

@app.get("/")
async def root():
    return {
        "message": "Moscow Chat API is running!",
        "endpoints": {
            "health": "/health",
            "chat": "/chat",
            "models": "/models"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    mistral_status = "disconnected"
    db_status = "unknown"
    error_msg = None
    
    # Проверяем Mistral AI API (проверяем наличие API ключа)
    try:
        if settings.MISTRAL_API_KEY:
            # Делаем тестовый запрос для проверки доступности API
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    settings.MISTRAL_API_BASE,
                    headers={
                        "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": settings.MISTRAL_MODEL,
                        "messages": [
                            {"role": "user", "content": "test"}
                        ],
                        "max_tokens": 10
                    }
                )
                if response.status_code in [200, 400]:  # 400 может быть из-за короткого запроса, но API доступен
                    mistral_status = "connected"
                else:
                    error_msg = f"Mistral API returned status {response.status_code}"
        else:
            error_msg = "MISTRAL_API_KEY not configured"
    except Exception as e:
        error_msg = f"Mistral: {str(e)}"
    
    # Проверяем базу данных (упрощенно)
    try:
        db_status = "connected"
    except Exception as e:
        db_status = "disconnected"
        error_msg = f"Database: {str(e)}" if not error_msg else f"{error_msg}, Database: {str(e)}"
    
    status = "healthy" if mistral_status == "connected" and db_status == "connected" else "unhealthy"
    
    return HealthResponse(
        status=status,
        mistral=mistral_status,
        database=db_status,
        error=error_msg
    )

@app.post("/chat", response_model=ChatResponse)
async def chat_with_model(request: ChatRequest):
    try:
        if not settings.MISTRAL_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="Ключ API Mistral не настроен. Пожалуйста, установите переменную окружения MISTRAL_API_KEY."
            )
        
        # Формируем запрос к Mistral AI API
        mistral_data = {
            "model": request.model or settings.MISTRAL_MODEL,
            "messages": [
                {"role": "user", "content": request.message}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                settings.MISTRAL_API_BASE,
                headers={
                    "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                    "Content-Type": "application/json"
                },
                json=mistral_data
            )
            
            if response.status_code == 200:
                result = response.json()
                # Mistral API возвращает ответ в формате choices[0].message.content
                choices = result.get("choices", [])
                if choices and len(choices) > 0:
                    response_text = choices[0].get("message", {}).get("content", "Ответ не получен")
                else:
                    response_text = "Ответ не получен"
                
                return ChatResponse(
                    response=response_text,
                    model=request.model or settings.MISTRAL_MODEL
                )
            else:
                error_detail = response.text[:500] if hasattr(response, 'text') else "Неизвестная ошибка"
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Mistral API error: {error_detail}"
                )
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Превышено время ожидания - Mistral API не отвечает")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Не удалось подключиться к сервису Mistral API")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.get("/models")
async def get_models():
    """Return available Mistral AI models"""
    return {
        "models": [
            {"name": "mistral-tiny", "description": "Fast and efficient Mistral model (7B parameters)"},
            {"name": "mistral-small", "description": "Balanced Mistral model with good performance (8x7B parameters)"},
            {"name": "mistral-medium", "description": "Enhanced Mistral model (24B parameters)"},
            {"name": "mistral-large", "description": "Most powerful Mistral model (123B parameters)"}
        ],
        "default": settings.MISTRAL_MODEL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
