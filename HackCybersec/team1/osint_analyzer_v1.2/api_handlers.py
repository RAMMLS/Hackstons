import requests
import whois
from urllib.parse import urlparse
import time

def check_accessibility(url):
    """Проверка доступности сайта"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        
        return {
            'http_status': response.status_code,
            'final_url': response.url,
            'headers': dict(response.headers),
            'requires_auth': response.status_code in [401, 403],
            'is_redirected': response.history != [],
            'access_time': response.elapsed.total_seconds()
        }
    except requests.exceptions.RequestException as e:
        return {
            'http_status': None,
            'error': str(e),
            'accessible': False
        }

def check_whois_info(url):
    """Получение WHOIS информации"""
    try:
        domain = urlparse(url).netloc
        whois_data = whois.whois(domain)
        
        return {
            'domain_name': whois_data.domain_name,
            'registrar': whois_data.registrar,
            'creation_date': str(whois_data.creation_date),
            'expiration_date': str(whois_data.expiration_date),
            'name_servers': whois_data.name_servers,
            'emails': whois_data.emails,
            'is_private': bool(whois_data.private) if hasattr(whois_data, 'private') else False
        }
    except Exception as e:
        return {'error': f'WHOIS ошибка: {str(e)}'}

def check_robots_txt(url):
    """Проверка robots.txt"""
    try:
        parsed_url = urlparse(url)
        robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
        
        response = requests.get(robots_url, timeout=5)
        
        if response.status_code == 200:
            return {
                'exists': True,
                'content': response.text[:500],  # Первые 500 символов
                'allows_crawling': 'User-agent: *' in response.text and 'Disallow: /' not in response.text
            }
        else:
            return {'exists': False}
    except:
        return {'exists': False, 'error': 'Не удалось получить robots.txt'}

def analyze_website_content(url):
    """Анализ содержимого сайта"""
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Поиск форм аутентификации
        login_forms = soup.find_all('form')
        has_login_form = any(
            form.find('input', {'type': 'password'}) or 
            'login' in form.get('action', '').lower() or
            'signin' in form.get('action', '').lower()
            for form in login_forms
        )
        
        # Поиск paywall индикаторов
        text = soup.get_text().lower()
        has_paywall_indicators = any(
            indicator in text for indicator in 
            ['subscribe', 'premium', 'membership', 'paywall', 'subscription']
        )
        
        return {
            'title': soup.title.string if soup.title else None,
            'has_login_form': has_login_form,
            'has_paywall_indicators': has_paywall_indicators,
            'form_count': len(login_forms),
            'meta_description': soup.find('meta', attrs={'name': 'description'})
        }
    except Exception as e:
        return {'error': f'Ошибка анализа контента: {str(e)}'}
