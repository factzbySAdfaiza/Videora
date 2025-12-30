// =====================================================
// Video Templates Library
// =====================================================

import { Template, TemplateCategory } from '../types';

export const VIDEO_TEMPLATES: Template[] = [
  {
    id: 'subscribe-bounce',
    name: 'Bouncing Subscribe Button',
    description: 'Eye-catching subscribe button with bounce animation and glow effect',
    category: TemplateCategory.SOCIAL_MEDIA,
    previewUrl: '/previews/subscribe-bounce.mp4',
    thumbnailUrl: '/thumbnails/subscribe-bounce.jpg',
    difficulty: 'beginner',
    estimatedDuration: 5,
    tags: ['button', 'subscribe', 'bounce', 'social'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    parameters: [
      {
        id: 'buttonText',
        name: 'buttonText',
        label: 'Button Text',
        type: 'text',
        defaultValue: 'SUBSCRIBE',
        description: 'Text displayed on the button',
        validation: { min: 1, max: 20 }
      },
      {
        id: 'buttonColor',
        name: 'buttonColor',
        label: 'Button Color',
        type: 'color',
        defaultValue: '#ff0000',
        description: 'Primary button color'
      },
      {
        id: 'glowIntensity',
        name: 'glowIntensity',
        label: 'Glow Intensity',
        type: 'number',
        defaultValue: 40,
        description: 'Glow effect intensity',
        validation: { min: 0, max: 100 }
      }
    ],
    tsxCode: `import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const buttonText = '{{buttonText}}';
  const buttonColor = '{{buttonColor}}';
  const glowIntensity = {{glowIntensity}};

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 }
  });

  const pulse = Math.sin(frame * 0.1) * 0.3 + 0.7;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          transform: \`scale(\${scale})\`,
          padding: '24px 48px',
          backgroundColor: buttonColor,
          color: 'white',
          fontSize: '48px',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: \`0 0 \${glowIntensity * pulse}px \${buttonColor}\`,
          cursor: 'pointer',
        }}
      >
        {buttonText}
      </div>
    </AbsoluteFill>
  );
};`
  },
  {
    id: 'countdown-timer',
    name: 'Countdown Timer',
    description: 'Animated countdown with neon glow effect',
    category: TemplateCategory.MARKETING,
    previewUrl: '/previews/countdown.mp4',
    thumbnailUrl: '/thumbnails/countdown.jpg',
    difficulty: 'beginner',
    estimatedDuration: 5,
    tags: ['countdown', 'timer', 'neon', 'urgency'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    parameters: [
      {
        id: 'startNumber',
        name: 'startNumber',
        label: 'Start Number',
        type: 'number',
        defaultValue: 5,
        description: 'Starting countdown number',
        validation: { min: 1, max: 10 }
      },
      {
        id: 'textColor',
        name: 'textColor',
        label: 'Text Color',
        type: 'color',
        defaultValue: '#3b82f6',
        description: 'Countdown number color'
      }
    ],
    tsxCode: `import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startNumber = {{startNumber}};
  const textColor = '{{textColor}}';

  const framesPerNumber = fps;
  const currentNumber = Math.max(0, startNumber - Math.floor(frame / framesPerNumber));

  const scale = interpolate(
    frame % framesPerNumber,
    [0, framesPerNumber / 2, framesPerNumber],
    [1, 1.2, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  const opacity = interpolate(
    frame % framesPerNumber,
    [0, framesPerNumber * 0.8, framesPerNumber],
    [1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0f',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          fontSize: '200px',
          fontWeight: 'bold',
          color: textColor,
          transform: \`scale(\${scale})\`,
          opacity,
          textShadow: \`0 0 40px \${textColor}, 0 0 80px \${textColor}\`,
        }}
      >
        {currentNumber}
      </div>
    </AbsoluteFill>
  );
};`
  },
  {
    id: 'typewriter-text',
    name: 'Typewriter Text',
    description: 'Text appearing letter by letter with cursor effect',
    category: TemplateCategory.EDUCATION,
    previewUrl: '/previews/typewriter.mp4',
    thumbnailUrl: '/thumbnails/typewriter.jpg',
    difficulty: 'intermediate',
    estimatedDuration: 5,
    tags: ['text', 'typewriter', 'animation', 'reveal'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    parameters: [
      {
        id: 'text',
        name: 'text',
        label: 'Text Content',
        type: 'text',
        defaultValue: 'NEW VIDEO',
        description: 'Text to display',
        validation: { min: 1, max: 50 }
      },
      {
        id: 'textColor',
        name: 'textColor',
        label: 'Text Color',
        type: 'color',
        defaultValue: '#f8fafc',
        description: 'Text color'
      },
      {
        id: 'speed',
        name: 'speed',
        label: 'Typing Speed',
        type: 'select',
        defaultValue: 'medium',
        description: 'Speed of typing animation',
        validation: { options: ['slow', 'medium', 'fast'] }
      }
    ],
    tsxCode: `import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const text = '{{text}}';
  const textColor = '{{textColor}}';
  const speed = '{{speed}}';

  const speedMultiplier = speed === 'slow' ? 1.5 : speed === 'fast' ? 0.5 : 1;
  const totalFrames = fps * 3 * speedMultiplier;

  const charsToShow = Math.floor(
    interpolate(frame, [0, totalFrames], [0, text.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    })
  );

  const displayText = text.substring(0, charsToShow);
  const showCursor = frame % 30 < 15;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'monospace',
      }}
    >
      <div style={{ fontSize: '72px', fontWeight: 'bold', color: textColor }}>
        {displayText}
        {showCursor && <span style={{ opacity: 0.8 }}>|</span>}
      </div>
    </AbsoluteFill>
  );
};`
  },
  {
    id: 'spinning-logo',
    name: 'Spinning Logo',
    description: 'Circular logo with rotation and glow animation',
    category: TemplateCategory.BUSINESS,
    previewUrl: '/previews/spinning-logo.mp4',
    thumbnailUrl: '/thumbnails/spinning-logo.jpg',
    difficulty: 'intermediate',
    estimatedDuration: 5,
    tags: ['logo', 'spin', 'rotation', 'brand'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    parameters: [
      {
        id: 'logoText',
        name: 'logoText',
        label: 'Logo Text',
        type: 'text',
        defaultValue: 'BRAND',
        description: 'Text inside the logo',
        validation: { min: 1, max: 10 }
      },
      {
        id: 'primaryColor',
        name: 'primaryColor',
        label: 'Primary Color',
        type: 'color',
        defaultValue: '#6366f1',
        description: 'Main logo color'
      },
      {
        id: 'secondaryColor',
        name: 'secondaryColor',
        label: 'Secondary Color',
        type: 'color',
        defaultValue: '#8b5cf6',
        description: 'Gradient secondary color'
      }
    ],
    tsxCode: `import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoText = '{{logoText}}';
  const primaryColor = '{{primaryColor}}';
  const secondaryColor = '{{secondaryColor}}';

  const rotation = interpolate(frame, [0, fps * 3], [0, 360], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1)
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 150 }
  });

  const pulse = Math.sin(frame * 0.1) * 0.3 + 0.7;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0f',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: \`linear-gradient(135deg, \${primaryColor}, \${secondaryColor})\`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: \`rotate(\${rotation}deg) scale(\${scale})\`,
          boxShadow: \`0 0 \${60 * pulse}px \${primaryColor}\`,
        }}
      >
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            transform: \`rotate(-\${rotation}deg)\`,
          }}
        >
          {logoText}
        </div>
      </div>
    </AbsoluteFill>
  );
};`
  }
];

export function getTemplateById(id: string): Template | undefined {
  return VIDEO_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return VIDEO_TEMPLATES.filter(t => t.category === category);
}

export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return VIDEO_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
