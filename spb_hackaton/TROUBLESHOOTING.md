# Troubleshooting Guide

## Error: ERR_EMPTY_RESPONSE

This error means the backend server closed the connection before sending a response. Here's how to fix it:

### Step 1: Check if all containers are running

```bash
docker ps
```

You should see two containers:
- `fastapi-backend`
- `react-frontend`

If any are missing, start them:
```bash
docker-compose up -d
```

### Step 2: Check backend logs

```bash
docker-compose logs backend
```

Look for:
- Python errors
- Connection errors to Mistral AI API
- API key errors
- Import errors

### Step 3: Verify Mistral AI API configuration

```bash
# Check if API key is set
docker exec fastapi-backend env | grep MISTRAL_API_KEY
```

If the API key is not set, you need to:
1. Get your API key from [Mistral AI Console](https://console.mistral.ai/)
2. Set it in your `.env` file or `docker-compose.yml`:
   ```bash
   MISTRAL_API_KEY=your_api_key_here
   ```
3. Restart the backend:
   ```bash
   docker-compose restart backend
   ```

### Step 4: Test Mistral AI API connection

Test the health endpoint:
```bash
curl http://localhost:8000/health
```

This should return JSON with status information including Mistral AI API status.

### Step 5: Test Mistral AI API directly

You can test the Mistral AI API endpoint:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "model": "mistral-small"}'
```

### Step 6: Restart services

If everything seems fine but still getting errors:

```bash
docker-compose restart
```

Or rebuild everything:
```bash
docker-compose down
docker-compose up -d --build
```

## Common Issues

### Issue: "Cannot connect to Mistral AI API" or "Mistral API key not configured"

**Solution:**
1. Verify your `MISTRAL_API_KEY` is set: `echo $MISTRAL_API_KEY`
2. Check that the API key is valid at [Mistral AI Console](https://console.mistral.ai/)
3. Ensure you have internet connection (Mistral API requires external access)
4. Check API quota and billing status
5. Restart backend: `docker-compose restart backend`

### Issue: "Mistral API returned status 401" or "Unauthorized"

**Solution:**
- Your API key is invalid or expired
- Get a new API key from [Mistral AI Console](https://console.mistral.ai/)
- Update the `MISTRAL_API_KEY` environment variable
- Restart the backend

### Issue: "Mistral API returned status 429" or "Rate limit exceeded"

**Solution:**
- You've exceeded your API quota
- Check your usage at [Mistral AI Console](https://console.mistral.ai/)
- Wait a few minutes before retrying
- Consider upgrading your API plan if needed
- Mistral AI offers free tier with limited requests

### Issue: Backend crashes immediately

**Solution:**
1. Check backend logs: `docker-compose logs backend`
2. Look for Python import errors
3. Verify all dependencies are installed: `docker exec fastapi-backend pip list`
4. Rebuild backend: `docker-compose up -d --build backend`

### Issue: Frontend can't connect to backend

**Solution:**
1. Verify backend is running on port 8000: `curl http://localhost:8000/`
2. Check CORS settings in `backend/app/config.py`
3. Make sure `REACT_APP_API_URL` is set correctly (should be `http://localhost:8000`)

### Issue: Request timeout

**Solution:**
- Mistral AI API requests typically take 5-30 seconds depending on the model and request complexity
- If it consistently times out, check your internet connection
- Verify API is accessible: `curl https://api.mistral.ai/v1/chat/completions`
- Check backend logs for detailed error messages
- Try using a smaller model like `mistral-tiny` for faster responses

## Browser Extension Errors

The errors about "message port closed" are from browser extensions (like ad blockers, password managers, etc.) and can be safely ignored. They don't affect the application.

## Getting Help

If you're still having issues:

1. Collect logs:
   ```bash
   docker-compose logs > logs.txt
   ```

2. Check system resources:
   ```bash
   docker stats
   ```

3. Verify network connectivity:
   ```bash
   docker exec fastapi-backend ping -c 3 api.mistral.ai
   ```

4. Test API key directly:
   ```bash
   curl -X POST https://api.mistral.ai/v1/chat/completions \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "mistral-small",
       "messages": [{"role": "user", "content": "test"}],
       "max_tokens": 10
     }'
   ```

## About Mistral AI

Mistral AI provides open-source language models:
- **Mistral 7B**: Fast and efficient 7B parameter model (Apache 2.0 license)
- **Mixtral 8x7B**: Mixture of Experts model with 8x7B parameters
- **Mistral Large**: Most powerful model (123B parameters)

All models are available via official API with open-source licenses, allowing you to:
- Use via API (current setup)
- Self-host the models locally
- Fine-tune for specific use cases

For more information, visit [Mistral AI Documentation](https://docs.mistral.ai/).
