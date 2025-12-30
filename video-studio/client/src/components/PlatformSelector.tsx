import { VideoSettings as VideoSettingsType, QualityPreset } from '../types';
import { PLATFORM_PRESETS, QUALITY_PRESET_CONFIGS } from '../constants/videoSettings';

interface PlatformSelectorProps {
    settings: VideoSettingsType;
    onChange: (settings: VideoSettingsType) => void;
}

const platformIcons: Record<string, JSX.Element> = {
    'YouTube': (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
    ),
    'Instagram Story': (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
    ),
    'Instagram Post': (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
    ),
    'TikTok': (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
    ),
    'Twitter': (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
    ),
    'Facebook': (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    )
};

const platformColors: Record<string, { bg: string; border: string; text: string }> = {
    'YouTube': { bg: 'rgba(255, 0, 0, 0.1)', border: 'rgba(255, 0, 0, 0.3)', text: '#ff4444' },
    'Instagram Story': { bg: 'rgba(225, 48, 108, 0.1)', border: 'rgba(225, 48, 108, 0.3)', text: '#e1306c' },
    'Instagram Post': { bg: 'rgba(225, 48, 108, 0.1)', border: 'rgba(225, 48, 108, 0.3)', text: '#e1306c' },
    'TikTok': { bg: 'rgba(0, 242, 234, 0.1)', border: 'rgba(0, 242, 234, 0.3)', text: '#00f2ea' },
    'Twitter': { bg: 'rgba(29, 161, 242, 0.1)', border: 'rgba(29, 161, 242, 0.3)', text: '#1da1f2' },
    'Facebook': { bg: 'rgba(24, 119, 242, 0.1)', border: 'rgba(24, 119, 242, 0.3)', text: '#1877f2' }
};

export default function PlatformSelector({ settings, onChange }: PlatformSelectorProps) {
    const handlePlatformSelect = (platformName: string) => {
        const platform = PLATFORM_PRESETS.find(p => p.name === platformName);
        if (platform) {
            onChange({ ...settings, ...platform.settings });
        }
    };

    const handleQualitySelect = (quality: QualityPreset) => {
        const presetConfig = QUALITY_PRESET_CONFIGS[quality];
        onChange({ ...settings, ...presetConfig });
    };

    const isSelected = (platformName: string) => {
        const platform = PLATFORM_PRESETS.find(p => p.name === platformName);
        if (!platform) return false;
        return settings.resolution.width === platform.settings.resolution.width &&
               settings.resolution.height === platform.settings.resolution.height;
    };

    return (
        <div style={styles.container}>
            {/* Platform Cards */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Choose Platform</h3>
                <div style={styles.platformGrid}>
                    {PLATFORM_PRESETS.map(platform => {
                        const colors = platformColors[platform.name] || { bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.3)', text: '#818cf8' };
                        const selected = isSelected(platform.name);
                        return (
                            <button
                                key={platform.name}
                                onClick={() => handlePlatformSelect(platform.name)}
                                style={{
                                    ...styles.platformCard,
                                    background: selected ? colors.bg : 'rgba(255, 255, 255, 0.02)',
                                    borderColor: selected ? colors.border : 'rgba(255, 255, 255, 0.06)',
                                    color: selected ? colors.text : '#71717a'
                                }}
                            >
                                <div style={styles.platformIcon}>
                                    {platformIcons[platform.name]}
                                </div>
                                <div style={styles.platformInfo}>
                                    <span style={{...styles.platformName, color: selected ? '#fafafa' : '#a1a1aa'}}>
                                        {platform.name}
                                    </span>
                                    <span style={styles.platformRes}>
                                        {platform.settings.resolution.width}×{platform.settings.resolution.height}
                                    </span>
                                </div>
                                {selected && <div style={{...styles.selectedDot, background: colors.text}} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Quality Presets */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Quality</h3>
                <div style={styles.qualityGrid}>
                    {Object.values(QualityPreset).map(quality => {
                        const selected = settings.quality === quality;
                        const qualityInfo = {
                            [QualityPreset.DRAFT]: { label: 'Draft', desc: 'Fast preview', icon: '⚡' },
                            [QualityPreset.STANDARD]: { label: 'Standard', desc: 'Balanced', icon: '✓' },
                            [QualityPreset.HIGH]: { label: 'High', desc: 'Best quality', icon: '★' },
                            [QualityPreset.ULTRA]: { label: 'Ultra', desc: '4K Premium', icon: '👑' }
                        }[quality];
                        return (
                            <button
                                key={quality}
                                onClick={() => handleQualitySelect(quality)}
                                style={{
                                    ...styles.qualityCard,
                                    background: selected ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))' : 'rgba(255, 255, 255, 0.02)',
                                    borderColor: selected ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.06)'
                                }}
                            >
                                <span style={styles.qualityIcon}>{qualityInfo.icon}</span>
                                <span style={{...styles.qualityLabel, color: selected ? '#e0e7ff' : '#a1a1aa'}}>
                                    {qualityInfo.label}
                                </span>
                                <span style={styles.qualityDesc}>{qualityInfo.desc}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Duration & Info */}
            <div style={styles.infoBar}>
                <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Duration</span>
                    <span style={styles.infoValue}>{settings.duration}s</span>
                </div>
                <div style={styles.infoDivider} />
                <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>FPS</span>
                    <span style={styles.infoValue}>{settings.fps}</span>
                </div>
                <div style={styles.infoDivider} />
                <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Resolution</span>
                    <span style={styles.infoValue}>{settings.resolution.width}×{settings.resolution.height}</span>
                </div>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    section: {},
    sectionTitle: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#a1a1aa',
        marginBottom: '14px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px'
    },
    platformGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
    },
    platformCard: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '20px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    platformIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    platformInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
    },
    platformName: {
        fontSize: '14px',
        fontWeight: 600
    },
    platformRes: {
        fontSize: '11px',
        color: '#52525b'
    },
    selectedDot: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        width: '8px',
        height: '8px',
        borderRadius: '50%'
    },
    qualityGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px'
    },
    qualityCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '16px 12px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    qualityIcon: {
        fontSize: '20px'
    },
    qualityLabel: {
        fontSize: '13px',
        fontWeight: 600
    },
    qualityDesc: {
        fontSize: '11px',
        color: '#52525b'
    },
    infoBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '16px 24px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.06)'
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
    },
    infoLabel: {
        fontSize: '11px',
        color: '#52525b',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px'
    },
    infoValue: {
        fontSize: '15px',
        fontWeight: 600,
        color: '#e4e4e7'
    },
    infoDivider: {
        width: '1px',
        height: '32px',
        background: 'rgba(255, 255, 255, 0.1)'
    }
};
