# OpenAI Configuration Guide

## Quick Setup for AI Video Generation

Your `.env` file should look like this:

```
AI_PROVIDER=openai
AI_API_KEY=sk-proj-your-actual-openai-api-key-here
```

## Important Notes:

1. **Get your OpenAI API Key:**
   - Visit https://platform.openai.com/api-keys
   - Create a new secret key
   - Copy it and paste it in your `.env` file

2. **Update your `.env` file:**
   - Make sure `AI_PROVIDER=openai` (not claude)
   - Replace `your_api_key_here` with your actual OpenAI API key
   - The key should start with `sk-proj-` or `sk-`

3. **Server already restarted:**
   - The server is now running with dotenv support
   - It will automatically load your API key from `.env`
   - No need to restart again

## Test AI Generation:

1. Open http://localhost:3000 in your browser
2. Click the "AI Generate" tab
3. Enter a prompt like: "Create a bouncing subscribe button with red background"
4. Click "Generate with AI"
5. The AI will generate the TSX code and render your video!

## Troubleshooting:

If you see "AI service not configured":
- Double-check your API key is correctly set in `.env`
- Ensure there are no extra spaces or quotes around the key
- Verify the key is valid and has available credits

If you see API errors:
- Check your OpenAI account has available credits
- Verify your API key hasn't been revoked
- Make sure you're using the correct API key format

Your server is ready! Just make sure your `.env` file has your OpenAI API key.
