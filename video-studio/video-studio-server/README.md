# Video Studio Server

Backend API server for Video Studio - handles video generation using Remotion.

## Deploy to Railway

1. Create new GitHub repo with this folder's contents
2. Go to [Railway](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Add environment variables:
   - `PORT`: 3000
   - `FRONTEND_URL`: Your Vercel frontend URL
   - `AI_PROVIDER`: openrouter (or claude, openai, a4f)
   - `AI_API_KEY`: Your API key

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `AI_PROVIDER` | AI service (claude/openai/a4f/openrouter) | Yes |
| `AI_API_KEY` | API key for AI service | Yes |
| `OPENROUTER_MODEL` | Model for OpenRouter | No |
| `A4F_ENHANCER_KEY` | Optional prompt enhancer | No |

## API Endpoints

- `GET /` - Health check
- `GET /api/health` - API health
- `GET /api/examples` - Example prompts
- `POST /api/generate` - Generate from TSX code
- `POST /api/generate-ai` - Generate from AI prompt
- `GET /api/status/:jobId` - Job status
- `GET /api/video/:jobId` - Download video
- `DELETE /api/video/:jobId` - Delete video

## Local Development

```bash
npm install
cp .env.example .env
# Edit .env with your keys
npm start
```
