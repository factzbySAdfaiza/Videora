# AI Video Studio 🎬

A full-stack web application for generating animated videos using AI and Remotion. Transform text prompts into professional animated videos with a clean, minimal interface.

## Features

- **AI-Powered Generation**: Convert text prompts to animated videos using Claude or OpenAI
- **Manual Code Input**: Paste your own Remotion TSX code for custom animations
- **Real-time Status Updates**: Watch your video generation progress live
- **Video Preview & Download**: Preview and download generated videos instantly
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Minimal UI**: Clean, modern interface with muted colors and intuitive navigation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure AI (Optional for Option 2)

To enable AI-powered video generation from text prompts, you have three options:

#### Option A: A4F (Free - Recommended for Testing)

1. Get a free API key from https://api.a4f.co
2. Copy the environment template:
   ```bash
   copy .env.example .env
   ```
3. Edit `.env`:
   ```
   AI_PROVIDER=a4f
   AI_API_KEY=your_a4f_api_key_here
   ```

#### Option B: Claude (Paid - High Quality)

1. Get API key from https://console.anthropic.com/
2. Edit `.env`:
   ```
   AI_PROVIDER=claude
   AI_API_KEY=sk-ant-your-key-here
   ```

#### Option C: OpenAI (Paid - High Quality)

1. Get API key from https://platform.openai.com/api-keys
2. Edit `.env`:
   ```
   AI_PROVIDER=openai
   AI_API_KEY=sk-proj-your-key-here
   ```

### 3. Start the Server

```bash
npm start
```

The application will be available at http://localhost:3000

## Usage

### Option 1: Paste Code (No AI Required)

1. Generate animation code using an AI service (like Claude at lmarena.ai)
2. Copy the generated TSX code
3. Open the application and click the "Paste Code" tab
4. Paste your code and click "Generate Video"
5. Wait for processing and download your video

### Option 2: AI Generate (Requires API Key)

1. Click the "AI Generate" tab
2. Describe your desired animation (e.g., "Create a bouncing subscribe button")
3. Click "Generate with AI"
4. The AI will create the code and generate your video automatically

## API Endpoints

- `POST /api/generate` - Generate video from TSX code
- `POST /api/generate-ai` - Generate video from text prompt (requires AI API key)
- `GET /api/status/:jobId` - Check video generation status
- `GET /api/video/:jobId` - Download generated video
- `GET /api/examples` - Get example prompts
- `DELETE /api/video/:jobId` - Delete generated video

## Project Structure

```
video-studio/
├── server/               # Backend Node.js server
│   ├── server.js        # Express server and API routes
│   ├── videoGenerator.js # Video rendering logic
│   ├── validator.js     # Input validation
│   └── aiService.js     # AI integration (Claude/OpenAI)
├── public/              # Frontend files
│   ├── index.html       # Main UI
│   ├── styles.css       # Minimal design system
│   └── app.js           # Frontend JavaScript
├── src/                 # Remotion source files
│   ├── MyVideo.tsx      # Dynamic video component
│   ├── Root.tsx         # Remotion composition
│   └── index.ts         # Entry point
├── videos/              # Generated videos (auto-created)
└── package.json         # Dependencies and scripts
```

## Configuration

### Video Settings

You can customize video parameters in the "Advanced Settings" section:

- **Duration**: 1-60 seconds
- **FPS**: 24, 25, 30, or 60
- **Width**: 100-3840 pixels
- **Height**: 100-2160 pixels

### AI Provider

Set in `.env` file:
- `AI_PROVIDER=claude` - Use Anthropic Claude (recommended)
- `AI_PROVIDER=openai` - Use OpenAI GPT-4

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Manually build a video (for testing)
npm run build-video
```

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Video Rendering**: Remotion
- **AI Integration**: Anthropic Claude / OpenAI
- **Design**: Minimal, responsive, muted color palette

## Troubleshooting

### AI Generation Not Working

- Ensure you've set `AI_API_KEY` in the `.env` file
- Check that your API key is valid and has available credits
- Verify `AI_PROVIDER` matches your API key (claude or openai)

### Video Generation Fails

- Check that the TSX code follows Remotion conventions
- Ensure all required imports are from 'react' or 'remotion' only
- Verify no dangerous code patterns (like `require`, `fetch`, etc.)

### Port Already in Use

Change the port in `.env`:
```
PORT=8080
```

## License

MIT

## Support

For issues or questions, please check the Remotion documentation: https://remotion.dev
