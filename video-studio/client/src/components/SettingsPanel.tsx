import { VideoSettings as VideoSettingsType, QualityPreset, AspectRatio } from '../types';
import {
    RESOLUTION_PRESETS,
    FPS_OPTIONS,
    DURATION_MIN,
    DURATION_MAX,
    MULTI_SEGMENT_THRESHOLD
} from '../constants/videoSettings';
import { estimateFileSize, formatFileSize } from '../utils/templateRenderer';

interface SettingsPanelProps {
    settings: VideoSettingsType;
    onChange: (settings: VideoSettingsType) => void;
    onClose: () => void;
}

export default function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
    const estimatedSize = estimateFileSize(
        settings.duration,
        settings.resolution.width,
        settings.resolution.height,
        settings.fps,
        settings.quality
    );

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.panel} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Video Settings</h2>
                    <button onClick={onClose} style={styles.closeBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div style={styles.content}>
                    {/* Duration */}
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <label style={styles.label}>Duration</label>
                            <span style={styles.value}>{settings.duration}s</span>
                        </div>
                        <input
                            type="range"
                            min={DURATION_MIN}
                            max={DURATION_MAX}
                            value={settings.duration}
                            onChange={(e) => onChange({ ...settings, duration: Number(e.target.value) })}
                            style={styles.slider}
                        />
                        <div style={styles.sliderLabels}>
                            <span>{DURATION_MIN}s</span>
                            <span style={styles.thresholdLabel}>15s single</span>
                            <span>{DURATION_MAX}s</span>
                        </div>
                        {settings.duration > MULTI_SEGMENT_THRESHOLD && (
                            <div style={styles.multiSegmentNote}>
                                🎬 Multi-segment mode: {Math.ceil(settings.duration / 10)} scenes
                            </div>
                        )}
                    </div>

                    {/* Resolution */}
                    <div style={styles.section}>
                        <label style={styles.label}>Resolution</label>
                        <div style={styles.resolutionGrid}>
                            {RESOLUTION_PRESETS.map(res => (
                                <button
                                    key={res.name}
                                    onClick={() => onChange({ ...settings, resolution: res })}
                                    style={{
                                        ...styles.resBtn,
                                        ...(settings.resolution.name === res.name ? styles.resBtnActive : {})
                                    }}
                                >
                                    <span style={styles.resName}>{res.label}</span>
                                    <span style={styles.resDim}>{res.width}×{res.height}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* FPS */}
                    <div style={styles.section}>
                        <label style={styles.label}>Frame Rate</label>
                        <div style={styles.fpsGrid}>
                            {FPS_OPTIONS.map(fps => (
                                <button
                                    key={fps}
                                    onClick={() => onChange({ ...settings, fps })}
                                    style={{
                                        ...styles.fpsBtn,
                                        ...(settings.fps === fps ? styles.fpsBtnActive : {})
                                    }}
                                >
                                    {fps} fps
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div style={styles.section}>
                        <label style={styles.label}>Aspect Ratio</label>
                        <div style={styles.aspectGrid}>
                            {Object.values(AspectRatio).map(ratio => (
                                <button
                                    key={ratio}
                                    onClick={() => onChange({ ...settings, aspectRatio: ratio })}
                                    style={{
                                        ...styles.aspectBtn,
                                        ...(settings.aspectRatio === ratio ? styles.aspectBtnActive : {})
                                    }}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Estimate */}
                    <div style={styles.estimate}>
                        <div style={styles.estimateRow}>
                            <span style={styles.estimateLabel}>Estimated file size</span>
                            <span style={styles.estimateValue}>{formatFileSize(estimatedSize)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
    },
    panel: {
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        background: 'rgba(24, 24, 27, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 28px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
    },
    title: {
        fontSize: '20px',
        fontWeight: 700,
        color: '#fafafa',
        margin: 0
    },
    closeBtn: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'none',
        borderRadius: '10px',
        padding: '10px',
        color: '#71717a',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        padding: '28px',
        overflowY: 'auto' as const,
        maxHeight: 'calc(90vh - 80px)'
    },
    section: {
        marginBottom: '28px'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px'
    },
    label: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#a1a1aa',
        display: 'block',
        marginBottom: '14px'
    },
    value: {
        fontSize: '16px',
        fontWeight: 700,
        color: '#818cf8'
    },
    slider: {
        width: '100%',
        height: '6px',
        borderRadius: '3px',
        background: 'rgba(255, 255, 255, 0.1)',
        outline: 'none',
        cursor: 'pointer'
    },
    sliderLabels: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#52525b',
        marginTop: '8px'
    },
    thresholdLabel: {
        color: '#818cf8'
    },
    multiSegmentNote: {
        marginTop: '12px',
        padding: '12px 16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '10px',
        fontSize: '13px',
        color: '#c7d2fe'
    },
    resolutionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px'
    },
    resBtn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '14px 12px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    resBtnActive: {
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
        borderColor: 'rgba(99, 102, 241, 0.4)'
    },
    resName: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#e4e4e7'
    },
    resDim: {
        fontSize: '10px',
        color: '#52525b'
    },
    fpsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px'
    },
    fpsBtn: {
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '10px',
        color: '#a1a1aa',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    fpsBtnActive: {
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
        borderColor: 'rgba(99, 102, 241, 0.4)',
        color: '#e0e7ff'
    },
    aspectGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px'
    },
    aspectBtn: {
        padding: '12px 8px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '10px',
        color: '#a1a1aa',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    aspectBtnActive: {
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
        borderColor: 'rgba(99, 102, 241, 0.4)',
        color: '#e0e7ff'
    },
    estimate: {
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.06)'
    },
    estimateRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    estimateLabel: {
        fontSize: '14px',
        color: '#71717a'
    },
    estimateValue: {
        fontSize: '18px',
        fontWeight: 700,
        color: '#818cf8'
    }
};
