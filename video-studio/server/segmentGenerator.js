// =====================================================
// Multi-Segment Video Generation Module
// =====================================================
// Handles generation of long-duration videos by splitting
// them into multiple scenes/segments and combining them

const fs = require('fs').promises;
const path = require('path');

// Segment configuration
const SEGMENT_CONFIG = {
    maxSegmentDuration: 15, // Maximum seconds per segment
    minSegmentDuration: 5,  // Minimum seconds per segment
    transitionFrames: 15,   // Frames for transitions between segments
};

/**
 * Calculates optimal segment breakdown for a given duration
 * @param {number} totalDuration - Total video duration in seconds
 * @param {number} fps - Frames per second
 * @returns {Array} Array of segment configurations
 */
function calculateSegments(totalDuration, fps = 30) {
    const segments = [];
    
    // For short videos (≤15s), use single segment
    if (totalDuration <= SEGMENT_CONFIG.maxSegmentDuration) {
        segments.push({
            index: 0,
            startTime: 0,
            duration: totalDuration,
            startFrame: 0,
            endFrame: totalDuration * fps,
            isFirst: true,
            isLast: true
        });
        return segments;
    }

    // Calculate optimal segment count
    const idealSegmentDuration = 10; // Target 10 seconds per segment
    const segmentCount = Math.ceil(totalDuration / idealSegmentDuration);
    const actualSegmentDuration = totalDuration / segmentCount;

    let currentTime = 0;
    for (let i = 0; i < segmentCount; i++) {
        const isFirst = i === 0;
        const isLast = i === segmentCount - 1;
        const duration = isLast 
            ? totalDuration - currentTime 
            : actualSegmentDuration;

        segments.push({
            index: i,
            startTime: currentTime,
            duration: duration,
            startFrame: Math.round(currentTime * fps),
            endFrame: Math.round((currentTime + duration) * fps),
            isFirst,
            isLast,
            transitionIn: !isFirst,
            transitionOut: !isLast
        });

        currentTime += duration;
    }

    return segments;
}

/**
 * Generates scene descriptions for AI to create segment code
 * @param {string} prompt - Original user prompt
 * @param {Array} segments - Segment configurations
 * @returns {Array} Array of scene prompts
 */
function generateScenePrompts(prompt, segments) {
    const scenePrompts = [];
    const totalSegments = segments.length;

    // Parse the original prompt for key elements
    const promptLower = prompt.toLowerCase();
    
    // Determine video type/theme
    const themes = {
        intro: ['intro', 'opening', 'start', 'beginning'],
        outro: ['outro', 'ending', 'conclusion', 'end'],
        tutorial: ['tutorial', 'how to', 'guide', 'learn'],
        promo: ['promo', 'advertisement', 'ad', 'commercial', 'product'],
        story: ['story', 'narrative', 'tale'],
        presentation: ['presentation', 'slides', 'showcase']
    };

    let videoType = 'general';
    for (const [type, keywords] of Object.entries(themes)) {
        if (keywords.some(kw => promptLower.includes(kw))) {
            videoType = type;
            break;
        }
    }

    segments.forEach((segment, index) => {
        let sceneDescription = '';
        const position = index / (totalSegments - 1 || 1); // 0 to 1

        if (totalSegments === 1) {
            // Single segment - use original prompt
            sceneDescription = prompt;
        } else if (index === 0) {
            // First segment - intro/hook
            sceneDescription = `SCENE ${index + 1} of ${totalSegments} (INTRO - ${segment.duration}s):
Create an attention-grabbing opening for: "${prompt}"
- Start with an impactful entrance animation
- Establish the visual theme and color palette
- Include a hook element that draws viewers in
- End with a smooth transition setup for the next scene
- This is the FIRST segment, so make a strong first impression`;
        } else if (index === totalSegments - 1) {
            // Last segment - conclusion/CTA
            sceneDescription = `SCENE ${index + 1} of ${totalSegments} (OUTRO - ${segment.duration}s):
Create a compelling conclusion for: "${prompt}"
- Begin with a transition from the previous scene
- Build to a climax or key message
- Include a call-to-action or memorable ending
- End with a satisfying conclusion animation
- This is the FINAL segment, so leave a lasting impression`;
        } else {
            // Middle segments - development
            const middleIndex = index - 1;
            const middleCount = totalSegments - 2;
            const middlePosition = middleIndex / (middleCount || 1);

            sceneDescription = `SCENE ${index + 1} of ${totalSegments} (MIDDLE - ${segment.duration}s):
Continue the story for: "${prompt}"
- Begin with a smooth transition from the previous scene
- Progress the narrative (${Math.round(middlePosition * 100)}% through the middle)
- Maintain visual consistency with established theme
- Add new elements or develop existing ones
- End with a transition setup for the next scene
- Keep the momentum and viewer engagement high`;
        }

        scenePrompts.push({
            segmentIndex: index,
            prompt: sceneDescription,
            duration: segment.duration,
            startFrame: segment.startFrame,
            endFrame: segment.endFrame,
            isFirst: segment.isFirst,
            isLast: segment.isLast,
            hasTransitionIn: segment.transitionIn,
            hasTransitionOut: segment.transitionOut
        });
    });

    return scenePrompts;
}

/**
 * Generates the segment-specific system prompt for AI
 * @param {Object} scenePrompt - Scene prompt configuration
 * @param {Object} config - Video configuration
 * @returns {string} System prompt for AI
 */
function getSegmentSystemPrompt(scenePrompt, config) {
    const { duration, isFirst, isLast, hasTransitionIn, hasTransitionOut, segmentIndex } = scenePrompt;
    const totalFrames = duration * config.fps;

    return `You are an expert motion graphics designer creating SEGMENT ${segmentIndex + 1} of a multi-segment video.

## SEGMENT SPECIFICATIONS
- Duration: ${duration} seconds (${totalFrames} frames at ${config.fps}fps)
- Resolution: ${config.width}x${config.height}
- Position: ${isFirst ? 'FIRST' : isLast ? 'LAST' : 'MIDDLE'} segment
${hasTransitionIn ? '- Has TRANSITION IN from previous segment (first 15 frames should fade/slide in)' : ''}
${hasTransitionOut ? '- Has TRANSITION OUT to next segment (last 15 frames should prepare for transition)' : ''}

## MANDATORY RULES
1. Component MUST be named "Scene${segmentIndex}" with exact export: \`export const Scene${segmentIndex}: React.FC = () => { ... }\`
2. ONLY imports allowed: AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Easing from 'remotion'
3. FORBIDDEN: useState, useEffect, setTimeout, setInterval, CSS animations, @keyframes
4. ALWAYS use interpolate() with: \`{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }\`
5. Use web-safe fonts: Arial, Helvetica, 'Segoe UI', sans-serif
6. Design for ${config.width}x${config.height} resolution

## TRANSITION HANDLING
${hasTransitionIn ? `
### Transition In (frames 0-15):
- Start with opacity 0, scale 0.9 or translateY offset
- Smoothly animate to full visibility
- Use spring or easeOut for natural feel
\`\`\`tsx
const transitionIn = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
\`\`\`` : ''}

${hasTransitionOut ? `
### Transition Out (frames ${totalFrames - 15}-${totalFrames}):
- Prepare elements for exit
- Slight scale down or position shift
- Don't fully exit - let next segment handle that
\`\`\`tsx
const transitionOut = interpolate(frame, [${totalFrames - 15}, ${totalFrames}], [1, 0.95], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
\`\`\`` : ''}

## TEMPLATE STRUCTURE
\`\`\`tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

export const Scene${segmentIndex}: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // Total frames for this segment
  const totalFrames = ${totalFrames};
  
  ${hasTransitionIn ? '// Transition in animation\n  const transitionIn = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: \'clamp\', extrapolateRight: \'clamp\' });' : ''}
  ${hasTransitionOut ? `// Transition out animation\n  const transitionOut = interpolate(frame, [${totalFrames - 15}, ${totalFrames}], [1, 0.95], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });` : ''}

  // Your animation logic here...

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        ${hasTransitionIn ? 'opacity: transitionIn,' : ''}
        ${hasTransitionOut ? 'transform: \`scale(\${transitionOut})\`,' : ''}
      }}
    >
      {/* Your animated elements */}
    </AbsoluteFill>
  );
};
\`\`\`

Generate ONLY the complete TSX code for this segment. No explanations.`;
}

/**
 * Generates the combined Root.tsx for multi-segment video
 * @param {Array} segments - Segment configurations
 * @param {Object} config - Video configuration
 * @returns {string} Root.tsx content
 */
function generateMultiSegmentRoot(segments, config) {
    const imports = segments.map((_, i) => 
        `import { Scene${i} } from './scenes/Scene${i}';`
    ).join('\n');

    const sequenceComponents = segments.map((segment, i) => {
        return `        <Sequence from={${segment.startFrame}} durationInFrames={${segment.endFrame - segment.startFrame}}>
          <Scene${i} />
        </Sequence>`;
    }).join('\n');

    const totalFrames = config.duration * config.fps;

    return `import React from 'react';
import { Composition, Sequence, AbsoluteFill } from 'remotion';
${imports}

// =====================================================
// MULTI-SEGMENT VIDEO COMPOSITION
// Total Duration: ${config.duration}s (${totalFrames} frames at ${config.fps}fps)
// Segments: ${segments.length}
// =====================================================

const MultiSegmentVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
${sequenceComponents}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyVideo"
      component={MultiSegmentVideo}
      durationInFrames={${totalFrames}}
      fps={${config.fps}}
      width={${config.width}}
      height={${config.height}}
    />
  );
};
`;
}

/**
 * Generates a single-segment Root.tsx (for short videos)
 * @param {Object} config - Video configuration
 * @returns {string} Root.tsx content
 */
function generateSingleSegmentRoot(config) {
    const totalFrames = config.duration * config.fps;

    return `import React from 'react';
import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';

// =====================================================
// VIDEO SETTINGS - Single Segment
// Duration: ${config.duration}s (${totalFrames} frames at ${config.fps}fps)
// =====================================================

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={${totalFrames}}
      fps={${config.fps}}
      width={${config.width}}
      height={${config.height}}
    />
  );
};
`;
}

/**
 * Writes segment files to the scenes directory
 * @param {Array} segmentCodes - Array of TSX code strings
 * @param {string} basePath - Base path for src directory
 */
async function writeSegmentFiles(segmentCodes, basePath) {
    const scenesDir = path.join(basePath, 'scenes');
    
    // Create scenes directory
    try {
        await fs.mkdir(scenesDir, { recursive: true });
    } catch (err) {
        // Directory might already exist
    }

    // Write each segment file
    for (let i = 0; i < segmentCodes.length; i++) {
        const filePath = path.join(scenesDir, `Scene${i}.tsx`);
        await fs.writeFile(filePath, segmentCodes[i], 'utf-8');
        console.log(`📝 Written segment ${i + 1}/${segmentCodes.length}: ${filePath}`);
    }
}

/**
 * Cleans up segment files after rendering
 * @param {number} segmentCount - Number of segments to clean
 * @param {string} basePath - Base path for src directory
 */
async function cleanupSegmentFiles(segmentCount, basePath) {
    const scenesDir = path.join(basePath, 'scenes');
    
    try {
        for (let i = 0; i < segmentCount; i++) {
            const filePath = path.join(scenesDir, `Scene${i}.tsx`);
            await fs.unlink(filePath);
        }
        // Try to remove the scenes directory if empty
        await fs.rmdir(scenesDir);
    } catch (err) {
        // Ignore cleanup errors
        console.log('Cleanup note:', err.message);
    }
}

/**
 * Validates segment code for common issues
 * @param {string} code - TSX code to validate
 * @param {number} segmentIndex - Expected segment index
 * @returns {Object} Validation result
 */
function validateSegmentCode(code, segmentIndex) {
    const errors = [];
    
    // Check for correct export name
    const expectedExport = `export const Scene${segmentIndex}`;
    if (!code.includes(expectedExport)) {
        errors.push(`Missing or incorrect export. Expected: ${expectedExport}`);
    }

    // Check for forbidden patterns
    const forbidden = ['useState', 'useEffect', 'setTimeout', 'setInterval'];
    forbidden.forEach(pattern => {
        if (code.includes(pattern)) {
            errors.push(`Forbidden pattern found: ${pattern}`);
        }
    });

    // Check for required imports
    if (!code.includes('from \'remotion\'') && !code.includes('from "remotion"')) {
        errors.push('Missing remotion import');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Fixes common issues in generated segment code
 * @param {string} code - TSX code to fix
 * @param {number} segmentIndex - Segment index
 * @returns {string} Fixed code
 */
function fixSegmentCode(code, segmentIndex) {
    let fixed = code;

    // Fix export name if wrong
    const wrongExports = [
        /export const MyVideo/g,
        /export const Scene\d+/g,
        /export const Video/g
    ];

    wrongExports.forEach(pattern => {
        fixed = fixed.replace(pattern, `export const Scene${segmentIndex}`);
    });

    // Ensure proper React import
    if (!fixed.includes('import React')) {
        fixed = `import React from 'react';\n${fixed}`;
    }

    return fixed;
}

module.exports = {
    SEGMENT_CONFIG,
    calculateSegments,
    generateScenePrompts,
    getSegmentSystemPrompt,
    generateMultiSegmentRoot,
    generateSingleSegmentRoot,
    writeSegmentFiles,
    cleanupSegmentFiles,
    validateSegmentCode,
    fixSegmentCode
};
