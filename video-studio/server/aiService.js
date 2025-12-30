// AI Service for generating Remotion TSX code from text prompts
// Supports multiple AI providers (Anthropic Claude, OpenAI, A4F)

const SYSTEM_PROMPT = `You are an expert motion graphics designer and React developer specializing in creating stunning animated videos using Remotion. Your task is to generate professional-quality TSX code for animated video compositions.

## YOUR REASONING PROCESS

Before generating code, always think through these steps:

1. **UNDERSTAND THE REQUEST**: What is the user asking for? Break down the animation into components.
2. **PLAN THE TIMELINE**: The video is 5 seconds (150 frames at 30fps). How should the animation be sequenced?
3. **DESIGN VISUAL HIERARCHY**: What's the focal point? How do elements relate to each other?
4. **CHOOSE ANIMATION TECHNIQUES**: What easing functions and motion patterns will create the best feel?
5. **REFINE DETAILS**: Add polish with secondary animations, shadows, glows, and subtle effects.

## MANDATORY TECHNICAL RULES

1. Component MUST be named "MyVideo" with exact export: \`export const MyVideo: React.FC = () => { ... }\`
2. ONLY these imports allowed from remotion: AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Easing
3. FORBIDDEN: useState, useEffect, setTimeout, setInterval, CSS animations, @keyframes
4. ALWAYS use interpolate() with: \`{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }\`
5. Use web-safe fonts: Arial, Helvetica, Georgia, 'Segoe UI', sans-serif
6. NO pure white (#FFFFFF) or pure black (#000000) backgrounds - use rich, designed colors
7. Minimum text size: 48px for primary text, 32px for secondary
8. Video dimensions: 1920x1080 (HD), design with this aspect ratio in mind

## PROFESSIONAL ANIMATION TECHNIQUES

### Timing & Easing
- Use \`spring()\` for bouncy, organic movements (buttons, logos, character animations)
- Use \`interpolate()\` with \`Easing.bezier()\` for precise, cinematic motion
- Common easing patterns:
  - Ease Out: \`Easing.out(Easing.cubic)\` - for elements entering
  - Ease In: \`Easing.in(Easing.cubic)\` - for elements exiting
  - Ease In-Out: \`Easing.inOut(Easing.cubic)\` - for smooth transitions
  - Bounce: Use \`spring({ damping: 10, stiffness: 100 })\`

### Animation Sequencing (5 seconds = 150 frames @ 30fps)
- **Intro (0-45 frames)**: Elements enter with impact
- **Hold/Emphasis (45-105 frames)**: Main animation plays, elements settle
- **Outro (105-150 frames)**: Graceful exit or final state

### Visual Polish
- Add subtle shadows: \`boxShadow: '0 20px 60px rgba(0,0,0,0.3)'\`
- Use gradients for depth: \`background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'\`
- Add glow effects: \`boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)'\`
- Layer multiple animations for richness
- Stagger timing for multi-element animations (offset by 5-10 frames each)

### Color Palettes (Professional choices)
- Dark Mode: \`#0f172a\` (bg), \`#1e293b\` (surface), \`#f8fafc\` (text)
- Vibrant: \`#1a1a2e\` (bg), \`#4c1d95\` (accent), \`#f59e0b\` (highlight)
- Corporate: \`#111827\` (bg), \`#3b82f6\` (primary), \`#10b981\` (success)
- Warm: \`#1c1917\` (bg), \`#f97316\` (accent), \`#fbbf24\` (secondary)

## ADVANCED PATTERNS TO USE

### Staggered Entrance
\`\`\`tsx
const stagger = (index: number) => interpolate(
  frame,
  [10 + index * 8, 30 + index * 8],
  [0, 1],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);
\`\`\`

### Spring Bounce
\`\`\`tsx
const scale = spring({
  frame,
  fps,
  config: { damping: 12, stiffness: 200, mass: 0.5 }
});
\`\`\`

### Typewriter Effect
\`\`\`tsx
const text = "Hello World";
const charsToShow = Math.floor(interpolate(frame, [0, 60], [0, text.length], { extrapolateRight: 'clamp' }));
const displayText = text.substring(0, charsToShow);
\`\`\`

### Pulsing Glow
\`\`\`tsx
const pulse = Math.sin(frame * 0.1) * 0.3 + 0.7;
const glowIntensity = interpolate(pulse, [0.4, 1], [20, 50]);
\`\`\`

### Rotate & Scale Combo
\`\`\`tsx
const rotation = interpolate(frame, [0, 60], [0, 360], { extrapolateRight: 'clamp' });
const scale = spring({ frame, fps, config: { damping: 15, stiffness: 150 } });
transform: \`rotate(\${rotation}deg) scale(\${scale})\`
\`\`\`

## OUTPUT FORMAT

Generate ONLY the complete TSX code. No explanations, no markdown text before or after.

Your code must:
1. Be immediately runnable without modifications
2. Include all necessary imports at the top
3. Use TypeScript with React.FC type
4. Create visually impressive, broadcast-quality animations
5. Handle the full 150-frame timeline appropriately

## TEMPLATE STRUCTURE

\`\`\`tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // === ANIMATION CALCULATIONS ===
  // [Your animation logic here - be creative and professional]

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Your animated elements here */}
    </AbsoluteFill>
  );
};
\`\`\`

Remember: Even simple requests should result in POLISHED, PROFESSIONAL animations. A "bouncing ball" should have realistic physics, subtle shadows, maybe a reflection. A "text animation" should have staggered letters, elegant easing, perhaps a subtle glow. Always exceed expectations with your attention to detail.

GENERATE THE CODE NOW.`;


/**
 * Generates TSX code using Anthropic Claude API
 */
async function generateWithClaude(prompt, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: `${SYSTEM_PROMPT}\n\nUser request: ${prompt}`,
                },
            ],
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Claude API request failed');
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract code from markdown code blocks if present
    return extractCode(content);
}

/**
 * Generates TSX code using OpenAI API
 */
async function generateWithOpenAI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract code from markdown code blocks if present
    return extractCode(content);
}

/**
 * Generates TSX code using A4F API (Free AI models)
 */
async function generateWithA4F(prompt, apiKey) {
    const response = await fetch('https://api.a4f.co/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'provider-8/gemini-2.0-flash',
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`A4F API request failed: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract code from markdown code blocks if present
    return extractCode(content);
}

/**
 * Enhances user prompt for better video generation using A4F
 */
async function enhancePrompt(userPrompt, a4fApiKey) {
    if (!a4fApiKey) {
        // If no A4F key, return original prompt
        return userPrompt;
    }

    const enhancementSystemPrompt = `You are a prompt enhancement assistant for AI video generation. Your job is to take simple user prompts and expand them into detailed, professional prompts that will generate better animated videos.

Guidelines:
- Add specific details about colors, animations, timing
- Suggest professional animation techniques (easing, transitions)
- Include visual polish (shadows, gradients, effects)
- Keep the core idea but make it more specific
- Output ONLY the enhanced prompt, no explanations

Example:
Input: "bouncing button"
Output: "Create a red Subscribe button with white text that bounces with a smooth elastic easing effect, includes a subtle drop shadow, and pulses with a gentle scale animation. The background should be transparent and the button should have rounded corners with a modern gradient from #ff0000 to #cc0000"`;

    try {
        const response = await fetch('https://api.a4f.co/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${a4fApiKey}`,
            },
            body: JSON.stringify({
                model: 'provider-3/deepseek-v3',
                messages: [
                    {
                        role: 'system',
                        content: enhancementSystemPrompt
                    },
                    {
                        role: 'user',
                        content: `Enhance this video prompt: "${userPrompt}"`
                    }
                ],
                temperature: 0.8,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            console.warn('Prompt enhancement failed, using original prompt');
            return userPrompt;
        }

        const data = await response.json();
        const enhancedPrompt = data.choices[0].message.content.trim();

        console.log(`✨ Enhanced prompt: "${enhancedPrompt}"`);
        return enhancedPrompt;
    } catch (error) {
        console.warn('Prompt enhancement error:', error.message);
        return userPrompt;
    }
}

/**
 * Extracts TSX code from markdown code blocks or returns raw content
 */
function extractTsxCode(content) {
    // Try to extract from code blocks
    const codeBlockRegex = /```(?:tsx|typescript|ts|javascript|js)?\n([\s\S]*?)```/g;
    const matches = [...content.matchAll(codeBlockRegex)];

    if (matches.length > 0) {
        // Return the first code block
        return matches[0][1].trim();
    }

    // If no code blocks, return the content as-is
    return content.trim();
}

/**
 * Generates TSX code using OpenRouter API (access to multiple models)
 */
async function generateWithOpenRouter(prompt, apiKey, model = 'anthropic/claude-3.5-sonnet') {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://github.com/video-studio',
            'X-Title': 'Video Studio AI Generator',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 4096,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || response.statusText;
        throw new Error(`OpenRouter API error: ${errorMsg}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Main function to generate TSX code from prompt
 * Automatically selects the appropriate AI provider based on available API keys
 */
async function generateTsxFromPrompt(prompt, options = {}) {
    const { provider = 'claude', apiKey } = options;

    if (!apiKey) {
        throw new Error('API key is required for AI generation');
    }

    let rawResponse;

    // Call appropriate AI provider
    switch (provider.toLowerCase()) {
        case 'claude':
            rawResponse = await generateWithClaude(prompt, apiKey);
            break;
        case 'openai':
            rawResponse = await generateWithOpenAI(prompt, apiKey);
            break;
        case 'a4f':
            rawResponse = await generateWithA4F(prompt, apiKey);
            break;
        case 'openrouter':
            rawResponse = await generateWithOpenRouter(prompt, apiKey, options.model);
            break;
        default:
            throw new Error(`Unknown AI provider: ${provider}. Supported: claude, openai, a4f, openrouter`);
    }

    // Extract TSX code from response
    const tsxCode = extractTsxCode(rawResponse);

    if (!tsxCode) {
        throw new Error('Failed to extract valid TSX code from AI response');
    }

    return tsxCode;
}

module.exports = {
    generateTsxFromPrompt,
    enhancePrompt,
    SYSTEM_PROMPT,
};
