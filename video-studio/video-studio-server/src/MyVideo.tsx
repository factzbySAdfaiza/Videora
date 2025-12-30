import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });

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
          transform: `scale(${scale})`,
          fontSize: '80px',
          fontWeight: 'bold',
          color: '#6366f1',
          textShadow: '0 0 40px rgba(99, 102, 241, 0.5)',
        }}
      >
        Video Studio
      </div>
    </AbsoluteFill>
  );
};
