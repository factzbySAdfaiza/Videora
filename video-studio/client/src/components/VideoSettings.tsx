import { useState } from 'react';
import { VideoSettings as VideoSettingsType, QualityPreset, AspectRatio } from '../types';
import {
  RESOLUTION_PRESETS,
  FPS_OPTIONS,
  PLATFORM_PRESETS,
  QUALITY_PRESET_CONFIGS,
  DURATION_MIN,
  DURATION_MAX,
  MULTI_SEGMENT_THRESHOLD
} from '../constants/videoSettings';
import { estimateFileSize, formatFileSize } from '../utils/templateRenderer';

interface VideoSettingsProps {
  settings: VideoSettingsType;
  onChange: (settings: VideoSettingsType) => void;
}

export default function VideoSettings({ settings, onChange }: VideoSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePresetChange = (preset: QualityPreset) => {
    const presetConfig = QUALITY_PRESET_CONFIGS[preset];
    onChange({ ...settings, ...presetConfig });
  };

  const handlePlatformPreset = (platformName: string) => {
    const platform = PLATFORM_PRESETS.find(p => p.name === platformName);
    if (platform) {
      onChange({ ...settings, ...platform.settings });
    }
  };

  const estimatedSize = estimateFileSize(
    settings.duration,
    settings.resolution.width,
    settings.resolution.height,
    settings.fps,
    settings.quality
  );

  return (
    <div style={s.container}>
      <h3 style={s.title}>Video Settings</h3>

      {/* Platform Presets */}
      <div style={s.section}>
        <label style={s.label}>Platform Presets</label>
        <div style={s.presets}>
          {PLATFORM_PRESETS.map(platform => (
            <button
              key={platform.name}
              onClick={() => handlePlatformPreset(platform.name)}
              style={s.preset}
              title={platform.name}
            >
              <span style={{ fontSize: '1.5rem' }}>{platform.icon}</span>
              <span style={{ fontSize: '0.75rem' }}>{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Preset */}
      <div style={s.section}>
        <label style={s.label}>Quality Preset</label>
        <div style={s.quality}>
          {Object.values(QualityPreset).map(preset => (
            <button
              key={preset}
              onClick={() => handlePresetChange(preset)}
              style={settings.quality === preset ? s.qualityActive : s.qualityInactive}
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div style={s.section}>
        <label style={s.label}>
          Duration: {settings.duration}s
          {settings.duration > MULTI_SEGMENT_THRESHOLD && (
            <span style={s.multiSegmentBadge}>
              🎬 Multi-segment ({Math.ceil(settings.duration / 10)} scenes)
            </span>
          )}
        </label>
        <input
          type="range"
          min={DURATION_MIN}
          max={DURATION_MAX}
          value={settings.duration}
          onChange={(e) => onChange({ ...settings, duration: Number(e.target.value) })}
          style={s.slider}
        />
        <div style={s.range}>
          <span>{DURATION_MIN}s</span>
          <span style={{ color: '#6366f1' }}>15s (single)</span>
          <span>{DURATION_MAX}s</span>
        </div>
        {settings.duration > MULTI_SEGMENT_THRESHOLD && (
          <div style={s.multiSegmentInfo}>
            Videos longer than 15 seconds are automatically split into multiple scenes for better quality.
            Each scene is generated separately and seamlessly combined.
          </div>
        )}
      </div>

      {/* Advanced Settings Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={s.toggle}
      >
        {showAdvanced ? '▼' : '▶'} Advanced Settings
      </button>

      {showAdvanced && (
        <>
          {/* Resolution */}
          <div style={s.section}>
            <label style={s.label}>Resolution</label>
            <select
              value={settings.resolution.name}
              onChange={(e) => {
                const res = RESOLUTION_PRESETS.find(r => r.name === e.target.value);
                if (res) onChange({ ...settings, resolution: res });
              }}
              style={s.select}
            >
              {RESOLUTION_PRESETS.map(res => (
                <option key={res.name} value={res.name}>
                  {res.label} ({res.width}x{res.height})
                </option>
              ))}
            </select>
          </div>

          {/* FPS */}
          <div style={s.section}>
            <label style={s.label}>Frame Rate (FPS)</label>
            <div style={s.fps}>
              {FPS_OPTIONS.map(fps => (
                <button
                  key={fps}
                  onClick={() => onChange({ ...settings, fps })}
                  style={settings.fps === fps ? s.fpsActive : s.fpsInactive}
                >
                  {fps}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div style={s.section}>
            <label style={s.label}>Aspect Ratio</label>
            <select
              value={settings.aspectRatio}
              onChange={(e) => onChange({ ...settings, aspectRatio: e.target.value as AspectRatio })}
              style={s.select}
            >
              {Object.values(AspectRatio).map(ratio => (
                <option key={ratio} value={ratio}>{ratio}</option>
              ))}
            </select>
          </div>

          {/* Custom Resolution */}
          <div style={s.section}>
            <label style={s.label}>Custom Resolution</label>
            <div style={s.custom}>
              <input
                type="number"
                placeholder="Width"
                value={settings.customSettings?.width || settings.resolution.width}
                onChange={(e) => onChange({
                  ...settings,
                  customSettings: {
                    ...settings.customSettings,
                    width: Number(e.target.value)
                  }
                })}
                style={s.input}
              />
              <span style={{ color: '#64748b' }}>×</span>
              <input
                type="number"
                placeholder="Height"
                value={settings.customSettings?.height || settings.resolution.height}
                onChange={(e) => onChange({
                  ...settings,
                  customSettings: {
                    ...settings.customSettings,
                    height: Number(e.target.value)
                  }
                })}
                style={s.input}
              />
            </div>
          </div>
        </>
      )}

      {/* Estimated File Size */}
      <div style={s.estimate}>
        <span style={s.estimateLabel}>Estimated file size:</span>
        <span style={s.estimateValue}>{formatFileSize(estimatedSize)}</span>
      </div>
    </div>
  );
}

const s = {
  container: {
    background: 'linear-gradient(135deg, #1a1a24, #12121a)',
    border: '1px solid #2a2a3a',
    borderRadius: '16px',
    padding: '1.5rem'
  },
  title: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#f1f5f9' },
  section: { marginBottom: '1.5rem' },
  label: {
    display: 'block',
    marginBottom: '0.75rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#cbd5e1'
  },
  presets: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '0.5rem'
  },
  preset: {
    padding: '0.75rem 0.5rem',
    background: '#0f0f15',
    border: '1px solid #2a2a3a',
    borderRadius: '10px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.8rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.25rem'
  },
  quality: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem'
  },
  qualityInactive: {
    padding: '0.75rem',
    background: '#0f0f15',
    border: '1px solid #2a2a3a',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  qualityActive: {
    padding: '0.75rem',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '8px',
    color: '#e0e7ff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    background: '#2a2a3a',
    cursor: 'pointer'
  } as React.CSSProperties,
  range: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.5rem'
  },
  toggle: {
    width: '100%',
    padding: '0.75rem',
    background: '#0f0f15',
    border: '1px solid #2a2a3a',
    borderRadius: '10px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textAlign: 'left' as const,
    marginBottom: '1rem'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    background: '#0f0f15',
    border: '1px solid #2a2a3a',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer'
  } as React.CSSProperties,
  fps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.5rem'
  },
  fpsInactive: {
    padding: '0.75rem',
    background: '#0f0f15',
    border: '1px solid #2a2a3a',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  fpsActive: {
    padding: '0.75rem',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '8px',
    color: '#e0e7ff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600
  },
  custom: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    background: '#0f0f15',
    border: '1px solid #2a2a3a',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    outline: 'none'
  } as React.CSSProperties,
  estimate: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '10px',
    marginTop: '1rem'
  },
  estimateLabel: { fontSize: '0.9rem', color: '#94a3b8' },
  estimateValue: { fontSize: '1.1rem', fontWeight: 700, color: '#6366f1' },
  multiSegmentBadge: {
    marginLeft: '0.75rem',
    padding: '0.25rem 0.5rem',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#c7d2fe',
    fontWeight: 500
  },
  multiSegmentInfo: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '8px',
    fontSize: '0.8rem',
    color: '#94a3b8',
    lineHeight: 1.5
  }
};
