from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import httpx
import os
import json
import re

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

from app.config import settings
from app.auth.auth_bearer import JWTBearer
from app.services.json_storage import storage

# Log configuration for debugging
import logging
logger = logging.getLogger(__name__)


class ProfileRequest(BaseModel):
    name: str
    age: int
    profession: str
    interests: list[str]
    education: str = ""
    location: str = ""
    bio: str = ""


class ArticleResponse(BaseModel):
    article: str
    topics: list[dict]


class ProfileData(BaseModel):
    name: str
    age: int
    profession: str
    interests: list[str]
    education: str = ""
    location: str = ""
    bio: str = ""


def extract_links_from_text(text: str) -> list[dict]:
    """Extract topics and potential links from the generated article"""
    topics = []
    
    # Look for markdown-style links [text](url)
    markdown_links = re.findall(r'\[([^\]]+)\]\(([^\)]+)\)', text)
    for link_text, url in markdown_links:
        topics.append({
            "title": link_text,
            "url": url,
            "type": "external"
        })
    
    # If no markdown links, extract key topics/phrases
    if not topics:
        # Look for capitalized phrases that might be topics
        potential_topics = re.findall(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b', text)
        for topic in set(potential_topics[:5]):  # Limit to 5 unique topics
            if len(topic) > 3:  # Filter out short words
                topics.append({
                    "title": topic,
                    "url": f"https://www.google.com/search?q={topic.replace(' ', '+')}",
                    "type": "search"
                })
    
    return topics


@router.get("/warmup")
async def warmup_model():
    """Test Mistral AI API connection"""
    try:
        print("Testing Mistral AI API connection...")
        if not settings.MISTRAL_API_KEY:
            return {"status": "error", "message": "MISTRAL_API_KEY not configured"}
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                settings.MISTRAL_API_BASE,
                headers={
                    "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": settings.MISTRAL_MODEL,
                    "messages": [
                        {"role": "user", "content": "Hello"}
                    ],
                    "max_tokens": 10
                }
            )
            if response.status_code == 200:
                return {"status": "success", "message": "Mistral AI API is ready"}
            else:
                return {"status": "error", "message": f"Failed to connect: {response.text[:200]}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/analyze", response_model=ArticleResponse)
async def analyze_profile(profile: ProfileRequest):
    """Analyze user profile and generate personalized article with topic links"""
    try:
        print(f"Received profile analysis request for: {profile.name}")
        
        if not settings.MISTRAL_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="Ключ API Mistral не настроен. Пожалуйста, установите переменную окружения MISTRAL_API_KEY."
            )
        
        # Build a detailed prompt for unique and well-formatted article generation
        interests_str = ", ".join(profile.interests)
        education_info = profile.education if profile.education else "Образование не указано"
        location_info = profile.location if profile.location else "Местоположение не указано"
        bio_info = profile.bio if profile.bio else ""
        
        prompt = f"""Напиши краткую и информативную статью (150-200 слов), которая будет интересна и полезна для человека со следующим профилем:
- Профессия: {profile.profession}
- Возраст: {profile.age} лет
- Образование: {education_info}
- Местоположение: {location_info}
- Интересы: {interests_str}
- Дополнительная информация: {bio_info}

ВАЖНО: Статья НЕ должна быть о пользователе. Вместо этого она должна содержать полезную информацию, советы, знания или интересные факты, релевантные для его профессии, интересов и профиля.

КРИТИЧЕСКИ ВАЖНЫЕ ТРЕБОВАНИЯ К ФОРМАТИРОВАНИЮ:
- ОБЯЗАТЕЛЬНО используй двойные переносы строк (\\n\\n) между каждым параграфом
- Статья должна содержать ровно 2-3 параграфа
- Каждый параграф должен быть отделен от предыдущего пустой строкой
- НЕ используй одинарные переносы строк внутри параграфов
- Каждый параграф должен содержать 2-4 предложения
- Используй четкие переходы между идеями

ТРЕБОВАНИЯ К СОДЕРЖАНИЮ:
- Статья должна быть краткой, но информативной (150-200 слов)
- Фокусируйся на информации, которая поможет человеку в его профессии ({profile.profession})
- Включай актуальные советы, тренды или знания в области его интересов: {interests_str}
- Предоставляй практическую ценность - то, что можно применить
- Используй конкретные примеры и факты
- Избегай общих фраз - будь конкретным и информативным
- Статья должна быть актуальной и современной

КРИТИЧЕСКИ ВАЖНЫЕ ТРЕБОВАНИЯ К ССЫЛКАМ:
- Включи ОБЯЗАТЕЛЬНО 6-8 естественных markdown ссылок в текст: [Название ресурса](https://реальный-url-ресурса.com)
- Ссылки должны быть на РЕАЛЬНЫЕ полезные ресурсы, связанные с темой статьи
- Используй разнообразные типы ресурсов:
  * Официальные сайты и документация
  * Образовательные платформы (Coursera, Stepik, Udemy и т.д.)
  * Полезные инструменты и сервисы
  * Статьи и блоги экспертов
  * Сообщества и форумы
  * YouTube каналы или подкасты
- Размещай ссылки естественно в тексте, где они дополняют информацию
- Используй описательный текст ссылок, который точно описывает ресурс
- Каждая ссылка должна быть уникальной и полезной
- Примеры формата: [Документация Python](https://docs.python.org), [Курс на Stepik](https://stepik.org/course/123), [Полезный инструмент](https://tool.com)

СТИЛЬ:
- Пиши от второго лица ("вы", "вам") или используй безличные конструкции
- Используй разнообразную структуру предложений
- Включай конкретные примеры, цифры, факты
- Сделай статью читаемой и увлекательной
- Убедись, что статья естественно течет от начала до конца
- Используй профессиональный, но доступный язык

ТЕМАТИКА СТАТЬИ:
Выбери тему, которая будет максимально полезна для человека с профессией "{profile.profession}" и интересами "{interests_str}". Это может быть:
- Советы по развитию в профессии
- Новые тренды в области интересов
- Практические рекомендации
- Образовательный контент
- Полезные инструменты или ресурсы

ВАЖНО: 
- Вся статья должна быть написана на русском языке
- Статья должна быть ПОЛЕЗНОЙ ИНФОРМАЦИЕЙ ДЛЯ пользователя, а не статьей О пользователе
- ОБЯЗАТЕЛЬНО используй двойные переносы строк (\\n\\n) между параграфами
- ОБЯЗАТЕЛЬНО включи 6-8 ссылок на реальные полезные ресурсы

Сгенерируй полезную статью сейчас:"""

        # Call Mistral AI API
        mistral_data = {
            "model": settings.MISTRAL_MODEL,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.9,
            "max_tokens": 400
        }
        
        print(f"Calling Mistral AI API at {settings.MISTRAL_API_BASE}")
        
        # Use a longer timeout for model generation
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(
                    settings.MISTRAL_API_BASE,
                    headers={
                        "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json=mistral_data
                )
                
                print(f"Mistral API response status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    # Mistral API возвращает ответ в формате choices[0].message.content
                    choices = result.get("choices", [])
                    if choices and len(choices) > 0:
                        article_text = choices[0].get("message", {}).get("content", "")
                    else:
                        article_text = ""
                    
                    if not article_text:
                        raise HTTPException(
                            status_code=500,
                            detail="Mistral API вернул пустой ответ. Пожалуйста, проверьте ваш API ключ и конфигурацию модели."
                        )
                    
                    # Extract topics and links from the article
                    topics = extract_links_from_text(article_text)
                    
                    print(f"Successfully generated article with {len(topics)} topics")
                    
                    return ArticleResponse(
                        article=article_text,
                        topics=topics
                    )
                else:
                    error_text = response.text[:500] if hasattr(response, 'text') else "Неизвестная ошибка"
                    print(f"Mistral API error: {error_text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Mistral API error (status {response.status_code}): {error_text}"
                    )
            except httpx.ConnectError as e:
                print(f"Connection error to Mistral API: {str(e)}")
                raise HTTPException(
                    status_code=503,
                    detail=f"Не удалось подключиться к Mistral API. Пожалуйста, проверьте ваше интернет-соединение и конфигурацию API ключа."
                )
            except httpx.TimeoutException:
                print("Mistral API request timeout")
                raise HTTPException(
                    status_code=504,
                    detail="Превышено время ожидания - Mistral API слишком долго отвечает. Пожалуйста, попробуйте снова."
                )
                
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/me")
async def get_user_profile(username: str = Depends(JWTBearer())):
    """Get current user's profile"""
    profile = storage.get_user_profile(username)
    if profile is None:
        return {"profile": None}
    return {"profile": profile}


@router.post("/me")
async def save_user_profile(profile: ProfileData, username: str = Depends(JWTBearer())):
    """Save current user's profile"""
    profile_dict = profile.dict()
    storage.save_user_profile(username, profile_dict)
    return {"message": "Profile saved successfully", "profile": profile_dict}
