import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Sequence } from 'remotion';

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // === UTILITY FUNCTIONS ===
  const springConfig = { damping: 15, stiffness: 150 };
  const springBounce = { damping: 10, stiffness: 100 };
  
  // Opening Logo Animation (0-90 frames)
  const logoScale = interpolate(frame, [0, 30, 60, 90], [0.5, 1.2, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(0.5))
  });
  
  const logoRotation = interpolate(frame, [0, 90], [0, 360], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic)
  });
  
  const logoGlowIntensity = interpolate(frame, [0, 30, 60, 90], [0, 80, 40, 60], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  
  // Particle animation
  const particleCount = 20;
  const particles = Array.from({ length: particleCount }).map((_, i) => {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = interpolate(frame, [0, 90], [0, 300], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
    const opacity = interpolate(frame, [0, 30, 60, 90], [0, 1, 0.5, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
    
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      opacity,
      size: Math.random() * 4 + 2
    };
  });

  // Text Animation (90-180 frames)
  const tagline = "Turn ideas into videos—instantly.";
  const textProgress = interpolate(frame, [90, 150], [0, tagline.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  const displayText = tagline.substring(0, Math.floor(textProgress));
  
  const textOpacity = interpolate(frame, [90, 110, 170, 180], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  
  const textScale = spring({
    frame: Math.max(0, frame - 90),
    fps,
    config: springBounce
  });

  // Feature Demo (180-360 frames)
  const featureOpacity = interpolate(frame, [180, 200, 340, 360], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  
  const leftPanelSlide = interpolate(frame, [180, 200], [-width/2, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  
  const rightPanelSlide = interpolate(frame, [180, 200], [width/2, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });

  // Button animation in feature demo
  const buttonScale = spring({
    frame: Math.max(0, frame - 240),
    fps,
    config: springBounce
  });
  
  const buttonBounce = interpolate(frame, [240, 250, 260, 270], [0, 1.2, 0.9, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(0.5))
  });

  // Backend Visualization (360-540 frames)
  const backendOpacity = interpolate(frame, [360, 380, 520, 540], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  
  const nodeCount = 12;
  const nodes = Array.from({ length: nodeCount }).map((_, i) => {
    const pulse = Math.sin((frame - 360) * 0.1 + i * 0.5) * 0.3 + 0.7;
    const glow = interpolate(pulse, [0.4, 1], [10, 30]);
    
    return {
      x: (i % 4) * 200 - 300,
      y: Math.floor(i / 4) * 150 - 150,
      pulse,
      glow
    };
  });

  // Closing CTA (540-750 frames)
  const ctaOpacity = interpolate(frame, [540, 570, 720, 750], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  
  const ctaSlide = interpolate(frame, [540, 570], [height, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(0.5))
  });
  
  const ctaScale = spring({
    frame: Math.max(0, frame - 570),
    fps,
    config: springConfig
  });
  
  const ctaGlow = interpolate(frame, [570, 600, 630, 660, 690], [1, 1.5, 1, 1.5, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const urlOpacity = interpolate(frame, [600, 630, 720, 750], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden'
      }}
    >
      {/* Grainy Overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
          opacity: 0.3,
          pointerEvents: 'none'
        }}
      />

      {/* Opening Logo Animation */}
      {frame < 90 && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {/* Particles */}
          {particles.map((particle, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                backgroundColor: '#4FACFE',
                borderRadius: '50%',
                left: `calc(50% + ${particle.x}px)`,
                top: `calc(50% + ${particle.y}px)`,
                opacity: particle.opacity,
                boxShadow: `0 0 10px #4FACFE`
              }}
            />
          ))}
          
          {/* 3D Logo */}
          <div
            style={{
              transform: `scale(${logoScale}) rotate(${logoRotation}deg)`,
              transition: 'all 0.3s ease'
            }}
          >
            <div
              style={{
                width: 200,
                height: 200,
                background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
                borderRadius: '30%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: `0 0 ${logoGlowIntensity}px rgba(79, 172, 254, 0.8)`,
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: 140,
                  height: 140,
                  backgroundColor: '#0f172a',
                  borderRadius: '20%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                    lineHeight: 1
                  }}
                >
                  V
                  <div style={{ fontSize: 24 }}>AI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text Animation */}
      {frame >= 90 && frame < 180 && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: textOpacity
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: '#f8fafc',
              textAlign: 'center',
              transform: `scale(${textScale})`,
              textShadow: '0 0 30px rgba(79, 172, 254, 0.5)',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            {displayText}
            <span style={{ opacity: Math.sin(frame * 0.1) * 0.5 + 0.5 }}>|</span>
          </div>
        </div>
      )}

      {/* Feature Demo Split Screen */}
      {frame >= 180 && frame < 360 && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            opacity: featureOpacity
          }}
        >
          {/* Left Panel - User Input */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#1e293b',
              margin: 20,
              borderRadius: 20,
              padding: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              transform: `translateX(${leftPanelSlide}px)`
            }}
          >
            <div
              style={{
                fontSize: 32,
                color: '#f8fafc',
                marginBottom: 40,
                fontWeight: 'bold'
              }}
            >
              User Prompt
            </div>
            <div
              style={{
                width: '80%',
                height: 200,
                backgroundColor: '#334155',
                borderRadius: 15,
                padding: 20,
                fontFamily: 'monospace',
                fontSize: 24,
                color: '#10b981',
                border: '2px solid #4FACFE',
                boxShadow: 'inset 0 0 20px rgba(79, 172, 254, 0.2)'
              }}
            >
              {"> "}
              {frame >= 210 ? "Bouncing subscribe button" : ""}
              <span style={{ opacity: Math.sin(frame * 0.1) * 0.5 + 0.5 }}>_</span>
            </div>
            <div
              style={{
                fontSize: 18,
                color: '#94a3b8',
                marginTop: 20,
                textAlign: 'center'
              }}
            >
              AI analyzing prompt...
            </div>
          </div>

          {/* Right Panel - Generated Animation */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#1e293b',
              margin: 20,
              borderRadius: 20,
              padding: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              transform: `translateX(${rightPanelSlide}px)`
            }}
          >
            <div
              style={{
                fontSize: 32,
                color: '#f8fafc',
                marginBottom: 40,
                fontWeight: 'bold'
              }}
            >
              Generated Video
            </div>
            {frame >= 240 && (
              <div
                style={{
                  transform: `scale(${buttonScale * buttonBounce})`,
                  transition: 'transform 0.2s ease'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#ef4444',
                    padding: '20px 40px',
                    borderRadius: 50,
                    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 'bold',
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    SUBSCRIBE
                  </div>
                </div>
              </div>
            )}
            <div
              style={{
                fontSize: 18,
                color: '#10b981',
                marginTop: 30,
                textAlign: 'center'
              }}
            >
              ✓ Animation generated in 2.3s
            </div>
          </div>
        </div>
      )}

      {/* Backend Visualization */}
      {frame >= 360 && frame < 540 && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: backendOpacity
          }}
        >
          <div
            style={{
              width: '80%',
              height: '80%',
              backgroundColor: '#1e293b',
              borderRadius: 20,
              padding: 40,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div
              style={{
                fontSize: 36,
                color: '#f8fafc',
                marginBottom: 30,
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Remotion Backend Processing
            </div>
            
            {/* Network Nodes */}
            {nodes.map((node, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 60,
                  height: 60,
                  backgroundColor: '#4FACFE',
                  borderRadius: '50%',
                  left: `calc(50% + ${node.x}px)`,
                  top: `calc(50% + ${node.y}px)`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: `0 0 ${node.glow}px rgba(79, 172, 254, 0.8)`,
                  opacity: node.pulse
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: '#0f172a',
                    borderRadius: '50%'
                  }}
                />
              </div>
            ))}
            
            {/* Data Streams */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                pointerEvents: 'none'
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => {
                const offset = (frame - 360 + i * 45) % 360;
                const opacity = interpolate(offset, [0, 90, 180, 270, 360], [0, 1, 1, 0, 0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp'
                });
                
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      width: 4,
                      height: 200,
                      backgroundColor: '#00F2FE',
                      left: `${20 + i * 12}%`,
                      top: `${offset}px`,
                      opacity,
                      borderRadius: 2,
                      boxShadow: '0 0 10px #00F2FE'
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Closing CTA */}
      {frame >= 540 && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: ctaOpacity
          }}
        >
          <div
            style={{
              transform: `translateY(${ctaSlide}px) scale(${ctaScale})`,
              transition: 'all 0.3s ease'
            }}
          >
            <div
              style={{
                backgroundColor: '#A18AFF',
                padding: '30px 60px',
                borderRadius: 50,
                boxShadow: `0 20px 60px rgba(161, 138, 255, ${ctaGlow * 0.5}), 0 0 ${ctaGlow * 40}px rgba(161, 138, 255, 0.6)`,
                background: 'linear-gradient(135deg, #A18AFF 0%, #764ba2 100%)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Try Videora AI Now
              </div>
            </div>
          </div>
          
          {frame >= 600 && (
            <div
              style={{
                marginTop: 40,
                fontSize: 24,
                color: '#f8fafc',
                opacity: urlOpacity,
                textShadow: '0 0 20px rgba(161, 138, 255, 0.5)'
              }}
            >
              videora.ai
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};