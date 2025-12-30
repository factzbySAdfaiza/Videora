import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Template, VideoSettings as VideoSettingsType } from '../types'
import { DEFAULT_VIDEO_SETTINGS, MULTI_SEGMENT_THRESHOLD } from '../constants/videoSettings'
import { saveToHistory } from '../utils/videoHistory'
import TemplateGallery from '../components/TemplateGallery'
import TemplateEditor from '../components/TemplateEditor'
import VideoHistoryPanel from '../components/VideoHistoryPanel'
import SettingsPanel from '../components/SettingsPanel'
import PlatformSelector from '../components/PlatformSelector'

type ViewMode = 'create' | 'templates' | 'history';
type CreateMode = 'ai' | 'code';

export default function Dashboard() {
    const { user, logout, coins, deductCoins, addCoins } = useAuth()
    const [viewMode, setViewMode] = useState<ViewMode>('create')
    const [createMode, setCreateMode] = useState<CreateMode>('ai')
    const [prompt, setPrompt] = useState('')
    const [tsxCode, setTsxCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [jobId, setJobId] = useState<string | null>(null)
    const [status, setStatus] = useState<any>(null)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [videoSettings, setVideoSettings] = useState<VideoSettingsType>(DEFAULT_VIDEO_SETTINGS)
    const [videoTitle, setVideoTitle] = useState('')
    const [showSettings, setShowSettings] = useState(false)

    const handleGenerate = async (code?: string, title?: string) => {
        const cost = 10
        if (coins < cost) {
            alert(`Insufficient coins! You need ${cost} coins but have ${coins}.`)
            return
        }
        setLoading(true)
        setJobId(null)
        setStatus(null)
        setVideoUrl(null)
        const startTime = Date.now()

        try {
            const endpoint = createMode === 'ai' ? '/api/generate-ai' : '/api/generate'
            const codeToUse = code || tsxCode
            const config = {
                duration: videoSettings.duration,
                fps: videoSettings.fps,
                width: videoSettings.customSettings?.width || videoSettings.resolution.width,
                height: videoSettings.customSettings?.height || videoSettings.resolution.height
            }
            const body = createMode === 'ai' ? { prompt, config } : { tsxCode: codeToUse, config }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to generate video')
            deductCoins(cost)
            setJobId(data.jobId)
            setVideoTitle(title || videoTitle || `Video ${new Date().toLocaleDateString()}`)
            pollStatus(data.jobId, startTime)
        } catch (error: any) {
            alert(error.message)
            setLoading(false)
        }
    }

    const pollStatus = async (id: string, startTime: number) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/status/${id}`)
                const data = await res.json()
                setStatus(data)
                if (data.status === 'completed') {
                    clearInterval(interval)
                    const videoPath = `/api/video/${id}`
                    setVideoUrl(videoPath)
                    setLoading(false)
                    const generationTime = Date.now() - startTime
                    saveToHistory({
                        userId: user?.email || 'anonymous',
                        title: videoTitle || `Video ${new Date().toLocaleDateString()}`,
                        prompt: createMode === 'ai' ? prompt : undefined,
                        templateId: selectedTemplate?.id,
                        templateName: selectedTemplate?.name,
                        videoUrl: videoPath,
                        thumbnailUrl: '',
                        settings: videoSettings,
                        metadata: {
                            fileSize: 0,
                            duration: videoSettings.duration,
                            resolution: {
                                width: videoSettings.customSettings?.width || videoSettings.resolution.width,
                                height: videoSettings.customSettings?.height || videoSettings.resolution.height
                            },
                            fps: videoSettings.fps,
                            format: 'mp4',
                            generationTime
                        },
                        status: 'available'
                    })
                } else if (data.status === 'failed') {
                    clearInterval(interval)
                    setLoading(false)
                    alert('Video generation failed: ' + (data.error || 'Unknown error'))
                }
            } catch (error) {
                clearInterval(interval)
                setLoading(false)
            }
        }, 2000)
    }

    const handleTemplateGenerate = (code: string, title: string) => {
        setVideoTitle(title)
        handleGenerate(code, title)
    }

    const reset = () => {
        setJobId(null)
        setStatus(null)
        setVideoUrl(null)
        setPrompt('')
        setTsxCode('')
        setSelectedTemplate(null)
        setVideoTitle('')
    }

    return (
        <div style={styles.container}>
            {/* Ambient Background */}
            <div style={styles.ambientBg}>
                <div style={styles.gradientOrb1} />
                <div style={styles.gradientOrb2} />
                <div style={styles.gradientOrb3} />
            </div>

            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.logoSection}>
                    <div style={styles.logoIcon}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M4 8L12 4L20 8V16L12 20L4 16V8Z" stroke="url(#logoGrad)" strokeWidth="2" strokeLinejoin="round"/>
                            <path d="M12 4V20" stroke="url(#logoGrad)" strokeWidth="2"/>
                            <path d="M4 8L20 16" stroke="url(#logoGrad)" strokeWidth="2"/>
                            <path d="M20 8L4 16" stroke="url(#logoGrad)" strokeWidth="2"/>
                            <defs>
                                <linearGradient id="logoGrad" x1="4" y1="4" x2="20" y2="20">
                                    <stop stopColor="#818cf8"/>
                                    <stop offset="1" stopColor="#c084fc"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span style={styles.logoText}>VideoAI</span>
                </div>

                <nav style={styles.nav}>
                    <button onClick={() => setViewMode('create')} style={viewMode === 'create' ? styles.navItemActive : styles.navItem}>
                        <span style={styles.navIcon}>✨</span>
                        <span>Create</span>
                    </button>
                    <button onClick={() => setViewMode('templates')} style={viewMode === 'templates' ? styles.navItemActive : styles.navItem}>
                        <span style={styles.navIcon}>📋</span>
                        <span>Templates</span>
                    </button>
                    <button onClick={() => setViewMode('history')} style={viewMode === 'history' ? styles.navItemActive : styles.navItem}>
                        <span style={styles.navIcon}>📚</span>
                        <span>History</span>
                    </button>
                </nav>

                <div style={styles.coinCard}>
                    <div style={styles.coinGlow} />
                    <div style={styles.coinContent}>
                        <div style={styles.coinHeader}>
                            <span style={styles.coinLabel}>Credits</span>
                            <button onClick={() => addCoins(1000)} style={styles.addCoinsBtn}>+ Add</button>
                        </div>
                        <div style={styles.coinValue}>{coins.toLocaleString()}</div>
                        <div style={styles.coinSubtext}>10 credits per video</div>
                    </div>
                </div>

                <div style={styles.userSection}>
                    <div style={styles.userAvatar}>{user?.name?.charAt(0) || 'U'}</div>
                    <div style={styles.userInfo}>
                        <div style={styles.userName}>{user?.name}</div>
                        <div style={styles.userEmail}>{user?.email}</div>
                    </div>
                    <button onClick={logout} style={styles.logoutBtn} title="Logout">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.main}>
                {viewMode === 'history' ? (
                    <VideoHistoryPanel />
                ) : viewMode === 'templates' ? (
                    selectedTemplate ? (
                        <TemplateEditor
                            template={selectedTemplate}
                            onGenerate={handleTemplateGenerate}
                            onBack={() => setSelectedTemplate(null)}
                        />
                    ) : (
                        <TemplateGallery onSelect={setSelectedTemplate} />
                    )
                ) : (
                    <div style={styles.createView}>
                        {/* Header */}
                        <div style={styles.header}>
                            <div>
                                <h1 style={styles.title}>Create Magic</h1>
                                <p style={styles.subtitle}>Transform your ideas into stunning videos with AI</p>
                            </div>
                            <button onClick={() => setShowSettings(!showSettings)} style={styles.settingsToggle}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                                </svg>
                                Settings
                            </button>
                        </div>

                        {/* Mode Toggle */}
                        <div style={styles.modeToggle}>
                            <button onClick={() => setCreateMode('ai')} style={createMode === 'ai' ? styles.modeActive : styles.modeInactive}>
                                <span style={styles.modeIcon}>🤖</span>
                                AI Generate
                            </button>
                            <button onClick={() => setCreateMode('code')} style={createMode === 'code' ? styles.modeActive : styles.modeInactive}>
                                <span style={styles.modeIcon}>💻</span>
                                Custom Code
                            </button>
                        </div>

                        {/* Main Creation Area */}
                        <div style={styles.creationArea}>
                            {/* Prompt Card */}
                            <div style={styles.promptCard}>
                                <div style={styles.promptGlow} />
                                {createMode === 'ai' ? (
                                    <>
                                        <label style={styles.promptLabel}>Describe your video</label>
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="A cinematic intro with glowing text that says 'Welcome' floating in space with particle effects..."
                                            style={styles.promptInput}
                                            rows={4}
                                        />
                                        <div style={styles.promptHints}>
                                            <span style={styles.hintChip}>💡 Be specific about colors</span>
                                            <span style={styles.hintChip}>🎬 Describe animations</span>
                                            <span style={styles.hintChip}>✨ Add visual effects</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <label style={styles.promptLabel}>Paste your Remotion TSX code</label>
                                        <textarea
                                            value={tsxCode}
                                            onChange={(e) => setTsxCode(e.target.value)}
                                            placeholder="export const MyVideo: React.FC = () => { ... }"
                                            style={{...styles.promptInput, fontFamily: 'monospace', fontSize: '13px'}}
                                            rows={8}
                                        />
                                    </>
                                )}
                            </div>

                            {/* Platform Selector */}
                            <PlatformSelector settings={videoSettings} onChange={setVideoSettings} />

                            {/* Generate Button */}
                            <button
                                onClick={() => handleGenerate()}
                                disabled={loading || (createMode === 'ai' ? !prompt.trim() : !tsxCode.trim())}
                                style={loading ? styles.generateBtnLoading : styles.generateBtn}
                            >
                                {loading ? (
                                    <>
                                        <div style={styles.spinner} />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <span style={styles.generateIcon}>✨</span>
                                        Generate Video
                                        <span style={styles.costBadge}>10 credits</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Progress Card */}
                        {status && !videoUrl && (
                            <div style={styles.progressCard}>
                                <div style={styles.progressHeader}>
                                    <h3 style={styles.progressTitle}>{status.statusMessage || 'Creating your video...'}</h3>
                                    {status.isMultiSegment && (
                                        <span style={styles.multiSegmentBadge}>
                                            🎬 {status.segmentStatuses?.filter((s: string) => s === 'completed').length || 0}/{status.segmentCount} scenes
                                        </span>
                                    )}
                                </div>
                                <div style={styles.progressBar}>
                                    <div style={{...styles.progressFill, width: `${status.progress}%`}} />
                                </div>
                                <div style={styles.progressPercent}>{status.progress}%</div>
                                {status.isMultiSegment && status.segmentStatuses && (
                                    <div style={styles.segmentDots}>
                                        {status.segmentStatuses.map((segStatus: string, idx: number) => (
                                            <div key={idx} style={{
                                                ...styles.segmentDot,
                                                background: segStatus === 'completed' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                                           segStatus === 'processing' ? 'linear-gradient(135deg, #818cf8, #c084fc)' : 'rgba(255,255,255,0.1)'
                                            }} title={`Scene ${idx + 1}`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video Result */}
                        {videoUrl && (
                            <div style={styles.resultCard}>
                                <div style={styles.resultGlow} />
                                <div style={styles.resultHeader}>
                                    <h3 style={styles.resultTitle}>🎉 Your video is ready!</h3>
                                </div>
                                <video src={videoUrl} controls style={styles.videoPlayer} />
                                <div style={styles.resultActions}>
                                    <a href={videoUrl} download style={styles.downloadBtn}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                        </svg>
                                        Download
                                    </a>
                                    <button onClick={reset} style={styles.newVideoBtn}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 5v14M5 12h14"/>
                                        </svg>
                                        Create New
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Panel */}
                {showSettings && (
                    <SettingsPanel
                        settings={videoSettings}
                        onChange={setVideoSettings}
                        onClose={() => setShowSettings(false)}
                    />
                )}
            </main>
        </div>
    )
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        background: '#09090b',
        color: '#fafafa',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        position: 'relative',
        overflow: 'hidden'
    },
    ambientBg: {
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
    },
    gradientOrb1: {
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)'
    },
    gradientOrb2: {
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
        filter: 'blur(60px)'
    },
    gradientOrb3: {
        position: 'absolute',
        top: '40%',
        left: '30%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)'
    },
    sidebar: {
        width: '280px',
        background: 'rgba(24, 24, 27, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 10
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px'
    },
    logoIcon: {
        width: '44px',
        height: '44px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    logoText: {
        fontSize: '22px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #818cf8, #c084fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: 'auto'
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        background: 'transparent',
        border: 'none',
        borderRadius: '12px',
        color: '#a1a1aa',
        fontSize: '15px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left' as const
    },
    navItemActive: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '12px',
        color: '#e0e7ff',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        textAlign: 'left' as const
    },
    navIcon: {
        fontSize: '18px'
    },

    coinCard: {
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        overflow: 'hidden'
    },
    coinGlow: {
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
        filter: 'blur(30px)'
    },
    coinContent: {
        position: 'relative',
        zIndex: 1
    },
    coinHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    coinLabel: {
        fontSize: '13px',
        color: '#fbbf24',
        fontWeight: 500,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px'
    },
    addCoinsBtn: {
        background: 'rgba(251, 191, 36, 0.2)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: '8px',
        padding: '6px 12px',
        color: '#fbbf24',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer'
    },
    coinValue: {
        fontSize: '32px',
        fontWeight: 700,
        color: '#fef3c7',
        lineHeight: 1.2
    },
    coinSubtext: {
        fontSize: '12px',
        color: '#a1a1aa',
        marginTop: '4px'
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.06)'
    },
    userAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #818cf8, #c084fc)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '16px'
    },
    userInfo: {
        flex: 1,
        minWidth: 0
    },
    userName: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#fafafa',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    userEmail: {
        fontSize: '12px',
        color: '#71717a',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    logoutBtn: {
        background: 'transparent',
        border: 'none',
        color: '#71717a',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    main: {
        flex: 1,
        padding: '32px 48px',
        overflowY: 'auto' as const,
        position: 'relative',
        zIndex: 10
    },
    createView: {
        maxWidth: '900px',
        margin: '0 auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px'
    },
    title: {
        fontSize: '36px',
        fontWeight: 700,
        margin: 0,
        background: 'linear-gradient(135deg, #fafafa, #a1a1aa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    subtitle: {
        fontSize: '16px',
        color: '#71717a',
        marginTop: '8px'
    },
    settingsToggle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: '#a1a1aa',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer'
    },

    modeToggle: {
        display: 'flex',
        gap: '8px',
        padding: '6px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '14px',
        marginBottom: '24px',
        border: '1px solid rgba(255, 255, 255, 0.06)'
    },
    modeActive: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 24px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '10px',
        color: '#e0e7ff',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer'
    },
    modeInactive: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 24px',
        background: 'transparent',
        border: '1px solid transparent',
        borderRadius: '10px',
        color: '#71717a',
        fontSize: '15px',
        fontWeight: 500,
        cursor: 'pointer'
    },
    modeIcon: {
        fontSize: '18px'
    },
    creationArea: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    promptCard: {
        position: 'relative',
        background: 'rgba(24, 24, 27, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '28px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden'
    },
    promptGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), rgba(168, 85, 247, 0.5), transparent)'
    },
    promptLabel: {
        display: 'block',
        fontSize: '14px',
        fontWeight: 600,
        color: '#e4e4e7',
        marginBottom: '16px'
    },
    promptInput: {
        width: '100%',
        padding: '18px 20px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        color: '#fafafa',
        fontSize: '15px',
        lineHeight: 1.6,
        resize: 'vertical' as const,
        outline: 'none',
        fontFamily: 'inherit'
    },
    promptHints: {
        display: 'flex',
        gap: '10px',
        marginTop: '16px',
        flexWrap: 'wrap' as const
    },
    hintChip: {
        padding: '8px 14px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        fontSize: '13px',
        color: '#a1a1aa'
    },
    generateBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '20px 32px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
        border: 'none',
        borderRadius: '16px',
        color: 'white',
        fontSize: '17px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
        position: 'relative',
        overflow: 'hidden'
    },
    generateBtnLoading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '20px 32px',
        background: 'rgba(99, 102, 241, 0.3)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '16px',
        color: '#a1a1aa',
        fontSize: '17px',
        fontWeight: 700,
        cursor: 'not-allowed'
    },
    generateIcon: {
        fontSize: '20px'
    },
    costBadge: {
        padding: '6px 12px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 600
    },
    spinner: {
        width: '20px',
        height: '20px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },

    progressCard: {
        background: 'rgba(24, 24, 27, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '28px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
    },
    progressHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    progressTitle: {
        fontSize: '16px',
        fontWeight: 600,
        color: '#e4e4e7',
        margin: 0
    },
    multiSegmentBadge: {
        padding: '6px 14px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '20px',
        fontSize: '13px',
        color: '#c7d2fe',
        fontWeight: 500
    },
    progressBar: {
        height: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '100px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #6366f1, #a855f7, #22d3ee)',
        borderRadius: '100px',
        transition: 'width 0.4s ease'
    },
    progressPercent: {
        fontSize: '14px',
        color: '#a1a1aa',
        marginTop: '12px',
        textAlign: 'right' as const
    },
    segmentDots: {
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
        justifyContent: 'center'
    },
    segmentDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        transition: 'all 0.3s ease'
    },
    resultCard: {
        position: 'relative',
        background: 'rgba(24, 24, 27, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '28px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        overflow: 'hidden'
    },
    resultGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #10b981, #22d3ee, transparent)'
    },
    resultHeader: {
        marginBottom: '20px'
    },
    resultTitle: {
        fontSize: '20px',
        fontWeight: 700,
        color: '#fafafa',
        margin: 0
    },
    videoPlayer: {
        width: '100%',
        borderRadius: '12px',
        background: '#000',
        marginBottom: '20px'
    },
    resultActions: {
        display: 'flex',
        gap: '12px'
    },
    downloadBtn: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        textDecoration: 'none',
        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
    },
    newVideoBtn: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px 24px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: '#e4e4e7',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer'
    }
}
