// AI Service for generating Remotion TSX code

const SYSTEM_PROMPT = `You are an expert motion graphics designer specializing in Remotion animations. Generate professional TSX code for animated videos.

RULES:
1. Component MUST be named "MyVideo": \`export const MyVideo: React.FC = () => { ... }\`
2. ONLY imports from 'react' and 'remotion' allowed
3. ALWAYS use interpolate() with: \`{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }\`
4. Use web-safe fonts: Arial, Helvetica, Georgia, sans-serif
5. Video is 5 seconds (150 frames at 30fps)

OUTPUT: Only TSX code, no explanations.

TEMPLATE:
\`\`\`tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Animation logic here
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
      {/* Elements here */}
    </AbsoluteFill>
  );
};
\`\`\``;

function extractCode(content) {
    const codeBlockRegex = /\`\`\`(?:tsx|typescript|ts|javascript|js)?\n([\s\S]*?)\`\`\`/g;
    const matches = [...content.matchAll(codeBlockRegex)];
    return matches.length > 0 ? matches[0][1].trim() : content.trim();
}

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
            messages: [{ role: 'user', content: `${SYSTEM_PROMPT}\n\nRequest: ${prompt}` }],
        }),
    });
    if (!response.ok) throw new Error('Claude API request failed');
    const data = await response.json();
    return extractCode(data.content[0].text);
}

async function generateWithOpenAI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
            temperature: 0.7,
        }),
    });
    if (!response.ok) throw new Error('OpenAI API request failed');
    const data = await response.json();
    return extractCode(data.choices[0].message.content);
}

async function generateWithA4F(prompt, apiKey) {
    const response = await fetch('https://api.a4f.co/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: 'provider-8/gemini-2.0-flash',
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
            temperature: 0.7,
        }),
    });
    if (!response.ok) throw new Error('A4F API request failed');
    const data = await response.json();
    return extractCode(data.choices[0].message.content);
}

async function generateWithOpenRouter(prompt, apiKey, model) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
            max_tokens: 4096,
            temperature: 0.7
        })
    });
    if (!response.ok) throw new Error('OpenRouter API request failed');
    const data = await response.json();
    return extractCode(data.choices[0].message.content);
}

async function enhancePrompt(userPrompt, a4fApiKey) {
    if (!a4fApiKey) return userPrompt;
    try {
        const response = await fetch('https://api.a4f.co/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${a4fApiKey}` },
            body: JSON.stringify({
                model: 'provider-3/deepseek-v3',
                messages: [
                    { role: 'system', content: 'Enhance video prompts with specific colors, animations, and effects. Output only the enhanced prompt.' },
                    { role: 'user', content: `Enhance: "${userPrompt}"` }
                ],
                temperature: 0.8,
                max_tokens: 500
            })
        });
        if (!response.ok) return userPrompt;
        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch {
        return userPrompt;
    }
}

async function generateTsxFromPrompt(prompt, options = {}) {
    const { provider = 'claude', apiKey, model } = options;
    if (!apiKey) throw new Error('API key required');

    switch (provider.toLowerCase()) {
        case 'claude': return generateWithClaude(prompt, apiKey);
        case 'openai': return generateWithOpenAI(prompt, apiKey);
        case 'a4f': return generateWithA4F(prompt, apiKey);
        case 'openrouter': return generateWithOpenRouter(prompt, apiKey, model);
        default: throw new Error(`Unknown provider: ${provider}`);
    }
}

module.exports = { generateTsxFromPrompt, enhancePrompt };
