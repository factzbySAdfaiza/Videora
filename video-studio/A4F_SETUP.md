# A4F AI Service Setup Guide

## What is A4F?

A4F (API for Free) provides **free access** to various AI models including Google's Gemini 2.0 Flash. This is a great option if you want to use AI-powered video generation without paying for API access.

## Quick Setup

Your `.env` file should look like this:

```
AI_PROVIDER=a4f
AI_API_KEY=your-a4f-api-key-here
```

## Get Your A4F API Key

1. **Visit A4F Website:**
   - Go to https://api.a4f.co

2. **Sign Up / Get API Key:**
   - Follow their registration process
   - Get your API key

3. **Update `.env` file:**
   ```
   AI_PROVIDER=a4f
   AI_API_KEY=your-actual-a4f-key
   ```

4. **Restart the server:**
   ```bash
   npm start
   ```

## What Model Does It Use?

The integration uses **Gemini 2.0 Flash** (`provider-8/gemini-2.0-flash`), which is:
- ✅ **Free** to use via A4F
- ✅ **Fast** response times
- ✅ **Good quality** code generation
- ✅ **No cost** - perfect for testing and development

## Test AI Generation

1. Open http://localhost:3000 in your browser
2. Click the "AI Generate" tab
3. Enter a prompt like: "Create a bouncing subscribe button with red background"
4. Click "Generate with AI"
5. Watch as Gemini generates your TSX code and renders the video!

## Benefits of A4F

- 💰 **Free** - No credit card required
- 🚀 **Fast** - Quick response times
- 🌐 **Accessible** - Easy to get started
- 🎯 **Good Quality** - Gemini 2.0 Flash is a capable model

## Alternative Providers

If you prefer, you can also use:

### Claude (Anthropic)
```
AI_PROVIDER=claude
AI_API_KEY=sk-ant-your-key
```
- Get key: https://console.anthropic.com/
- Paid service with high quality

### OpenAI
```
AI_PROVIDER=openai
AI_API_KEY=sk-proj-your-key
```
- Get key: https://platform.openai.com/api-keys
- Paid service using GPT-4o-mini

## Troubleshooting

**"AI service not configured" error:**
- Make sure your `.env` file has `AI_PROVIDER=a4f`
- Verify your A4F API key is correct
- Restart the server after changing `.env`

**API request failed:**
- Check if your A4F API key is valid
- Verify you have internet connection
- Try the free tier limits haven't been exceeded

**Code generation issues:**
- The prompt might be too complex
- Try simpler, clearer descriptions
- Check the console logs for specific errors

## Ready to Go!

Your server is configured to use A4F with Gemini 2.0 Flash. Just make sure your `.env` file has your A4F API key and you're ready to generate videos with AI for free! 🎬
