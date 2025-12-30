import React from 'react';
import { Composition, Sequence, AbsoluteFill } from 'remotion';
import { Scene0 } from './scenes/Scene0';
import { Scene1 } from './scenes/Scene1';
import { Scene2 } from './scenes/Scene2';
import { Scene3 } from './scenes/Scene3';
import { Scene4 } from './scenes/Scene4';
import { Scene5 } from './scenes/Scene5';

// =====================================================
// MULTI-SEGMENT VIDEO COMPOSITION
// Total Duration: 60s (1800 frames at 30fps)
// Segments: 6
// =====================================================

const MultiSegmentVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
        <Sequence from={0} durationInFrames={300}>
          <Scene0 />
        </Sequence>
        <Sequence from={300} durationInFrames={300}>
          <Scene1 />
        </Sequence>
        <Sequence from={600} durationInFrames={300}>
          <Scene2 />
        </Sequence>
        <Sequence from={900} durationInFrames={300}>
          <Scene3 />
        </Sequence>
        <Sequence from={1200} durationInFrames={300}>
          <Scene4 />
        </Sequence>
        <Sequence from={1500} durationInFrames={300}>
          <Scene5 />
        </Sequence>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyVideo"
      component={MultiSegmentVideo}
      durationInFrames={1800}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
