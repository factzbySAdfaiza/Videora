import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Template, VideoSettings as VideoSettingsType } from '../types'
import { DEFAULT_VIDEO_SETTINGS } from '../constants/videoSettings'
import { saveToHistory } from '../utils/videoHistory'
import TemplateSelector from '../components/TemplateSelector'
import TemplateEditor from '../components/TemplateEditor'
import VideoHistory from '../components/VideoHistory'
import VideoSettings from '../components/VideoSettings'

type ViewMode = 'create' | 'history';
type CreateMode = 'ai' | 'code' | 'template';

export default function Dashboard() {
    const { user, logout, coins, deductCoins, addCoins } = useAuth()
    const [viewMode, setViewMode] = useState<ViewMode>('create')
    const [createMode, setCreateMode] = useState<CreateMode>('template')
    const [prompt, setPrompt] = useState('')
    const [tsxCode, setTsxCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [jobId, setJobId] = useState<string | null>(null)
    const [status, setStatus] = useState<any>(null)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [videoSettings, setVideoSettings] = useState<VideoSettingsType>(DEFAULT_VIDEO_SETTINGS)
    const [videoTitle, setVideoTitle] = useState('')

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

            const body = createMode === 'ai'
                ? { prompt, config }
                : { tsxCode: codeToUse, config }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate video')
            }

            deductCoins(cost)
            setJobId(data.jobId)
            setVideoTitle(title || videoTitle || `Video ${new Date().toLocaleDateString()}`)
            pollStatus(data.jobId, startTime)
        } catch (error: any) {
            alert(error.message)
            setLoading(false)
        }
    }

    const handleTemplateGenerate = (code: string, title: string) => {
        setVideoTitle(title)
        handleGenerate(code, title)
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

                    // Save to history
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
                            fileSize: 0, // Will be updated when downloaded
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
                console.error(error)
            }
        }, 2000)
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
        <div style={s.dash}>
            <aside style={s.side}>
                <div style={s.logo}>
                    <span style={s.icon}>▶</span>
                    <span style={s.text}>VideoAI Studio</span>
                </div>

                <div style={s.coins}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <span style={{ fontSize: '1.5rem' }}>🪙</span>
                        <div>
                            <div style={s.coinVal}>{coins}</div>
                            <div style={s.coinLbl}>coins</div>
                        </div>
                    </div>
                    <button
                        onClick={() => addCoins(1000)}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                        title="Add 1000 Coins"
                    >
                        +
                    </button>
                </div>

                <div style={s.user}>
                    <div style={s.avatar}>{user?.name.charAt(0) || 'U'}</div>
                    <div>
                        <div style={s.name}>{user?.name}</div>
                        <div style={s.email}>{user?.email}</div>
                    </div>
                </div>

                <button onClick={logout} style={s.logout}>Logout</button>
            </aside>

            <main style={s.main}>
                <div style={s.topBar}>
                    <div>
                        <h1 style={s.title}>
                            {viewMode === 'create' ? 'Create Your Video' : 'Video History'}
                        </h1>
                        <p style={s.sub}>Costs 10 coins per video • {coins} coins remaining</p>
                    </div>
                    <div style={s.viewToggle}>
                        <button
                            style={viewMode === 'create' ? s.viewOn : s.viewOff}
                            onClick={() => setViewMode('create')}
                        >
                            ✨ Create
                        </button>
                        <button
                            style={viewMode === 'history' ? s.viewOn : s.viewOff}
                            onClick={() => setViewMode('history')}
                        >
                            📚 History
                        </button>
                    </div>
                </div>

                {viewMode === 'history' ? (
                    <VideoHistory />
                ) : (
                    <>
                        <div style={s.card}>
                            <div style={s.mode}>
                                <button
                                    style={createMode === 'template' ? s.modeOn : s.modeOff}
                                    onClick={() => { setCreateMode('template'); setSelectedTemplate(null); }}
                                >
                                    📋 Templates
                                </button>
                                <button
                                    style={createMode === 'ai' ? s.modeOn : s.modeOff}
                                    onClick={() => setCreateMode('ai')}
                                >
                                    🤖 AI Generate
                                </button>
                                <button
                                    style={createMode === 'code' ? s.modeOn : s.modeOff}
                                    onClick={() => setCreateMode('code')}
                                >
                                    💻 Paste Code
                                </button>
                            </div>

                            {createMode === 'template' ? (
                                selectedTemplate ? (
                                    <TemplateEditor
                                        template={selectedTemplate}
                                        onGenerate={handleTemplateGenerate}
                                        onBack={() => setSelectedTemplate(null)}
                                    />
                                ) : (
                                    <TemplateSelector onSelect={setSelectedTemplate} />
                                )
                            ) : createMode === 'ai' ? (
                                <div>
                                    <label style={s.label}>What do you want to create?</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="e.g., Create a bouncing subscribe button..."
                                        style={s.input}
                                        rows={5}
                                    />
                                    <button
                                        style={loading ? s.btnOff : s.btn}
                                        onClick={() => handleGenerate()}
                                        disabled={loading}
                                    >
                                        {loading ? '⏳ Generating...' : '✨ Generate Video (10 coins)'}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <label style={s.label}>Paste your TSX code</label>
                                    <textarea
                                        value={tsxCode}
                                        onChange={(e) => setTsxCode(e.target.value)}
                                        placeholder="export const MyVideo..."
                                        style={{ ...s.input, fontFamily: 'monospace' }}
                                        rows={8}
                                    />
                                    <button
                                        style={loading ? s.btnOff : s.btn}
                                        onClick={() => handleGenerate()}
                                        disabled={loading}
                                    >
                                        {loading ? '⏳ Generating...' : '✨ Generate Video (10 coins)'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {(createMode === 'ai' || createMode === 'code') && !selectedTemplate && (
                            <VideoSettings settings={videoSettings} onChange={setVideoSettings} />
                        )}

                        {status && !videoUrl && (
                            <div style={s.card}>
                                <h3 style={s.h3}>
                                    {status.statusMessage || '🎨 Generating...'}
                                </h3>
                                {status.isMultiSegment && (
                                    <div style={s.segmentInfo}>
                                        <span style={s.segmentBadge}>🎬 Multi-segment video</span>
                                        <span style={s.segmentCount}>
                                            {status.segmentStatuses?.filter((s: string) => s === 'completed').length || 0} / {status.segmentCount} scenes
                                        </span>
                                    </div>
                                )}
                                <div style={s.bar}>
                                    <div style={{ ...s.fill, width: `${status.progress}%` }} />
                                </div>
                                <p style={s.prog}>
                                    {status.progress}% complete
                                    {status.status === 'processing' && status.statusMessage && (
                                        <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                                            {status.statusMessage}
                                        </span>
                                    )}
                                </p>
                                {status.isMultiSegment && status.segmentStatuses && (
                                    <div style={s.segmentProgress}>
                                        {status.segmentStatuses.map((segStatus: string, idx: number) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    ...s.segmentDot,
                                                    background: segStatus === 'completed' ? '#10b981' :
                                                               segStatus === 'failed' ? '#ef4444' :
                                                               segStatus === 'processing' ? '#6366f1' : '#2a2a3a'
                                                }}
                                                title={`Scene ${idx + 1}: ${segStatus}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {videoUrl && (
                            <div style={s.card}>
                                <h3 style={s.h3}>🎉 Video Ready!</h3>
                                <video src={videoUrl} controls style={s.vid} />
                                <div style={s.acts}>
                                    <a href={videoUrl} download style={s.dl}>📥 Download</a>
                                    <button onClick={reset} style={s.new}>🔄 New Video</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

const s = {
    dash: { display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0f', color: '#f1f5f9', fontFamily: 'Inter, sans-serif' },
    side: { width: '260px', background: 'linear-gradient(180deg, #12121a, #0f0f15)', borderRight: '1px solid #1f1f29', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column' as const, gap: '1.5rem', minHeight: '100vh' },
    logo: { display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1f1f29' },
    icon: { fontSize: '2rem', color: '#6366f1' },
    text: { fontSize: '1.25rem', fontWeight: 700 },
    coins: { padding: '1.5rem', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 8px 24px rgba(251,191,36,0.3)' },
    coinVal: { fontSize: '2rem', fontWeight: 800, color: '#78350f' },
    coinLbl: { fontSize: '0.8rem', color: '#92400e' },
    user: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#1a1a24', borderRadius: '12px', marginTop: 'auto' },
    avatar: { width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' },
    name: { fontSize: '0.95rem', fontWeight: 600 },
    email: { fontSize: '0.8rem', color: '#64748b' },
    logout: { padding: '0.75rem', background: 'transparent', border: '1px solid #2a2a3a', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem' },
    main: { flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' as const },
    title: { fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' },
    sub: { color: '#64748b' },
    viewToggle: { display: 'flex', gap: '0.5rem', padding: '4px', background: '#0f0f15', borderRadius: '10px' },
    viewOff: { padding: '0.75rem 1.5rem', background: 'transparent', border: 'none', color: '#64748b', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
    viewOn: { padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)', color: '#e0e7ff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
    card: { background: 'linear-gradient(135deg, #1a1a24, #12121a)', border: '1px solid #2a2a3a', borderRadius: '20px', padding: '2rem', marginBottom: '2rem', overflow: 'hidden' },
    mode: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '2rem', padding: '6px', background: '#0f0f15', borderRadius: '12px' },
    modeOff: { padding: '1rem', background: 'transparent', border: 'none', color: '#64748b', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
    modeOn: { padding: '1rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)', color: '#e0e7ff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
    label: { display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 600, color: '#cbd5e1' },
    input: { width: '100%', padding: '1rem', background: '#0f0f15', border: '1px solid #2a2a3a', borderRadius: '12px', color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', resize: 'vertical' as const, marginBottom: '1.5rem', fontFamily: 'inherit' },
    btn: { width: '100%', padding: '1.25rem 2rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' },
    btnOff: { width: '100%', padding: '1.25rem 2rem', background: '#2a2a3a', border: 'none', borderRadius: '14px', color: '#64748b', fontSize: '1.1rem', fontWeight: 700, cursor: 'not-allowed', opacity: 0.6 },
    h3: { fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' },
    bar: { height: '10px', background: '#1a1a24', borderRadius: '100px', overflow: 'hidden', marginBottom: '1rem' },
    fill: { height: '100%', background: 'linear-gradient(90deg, #6366f1, #22d3ee)', borderRadius: '100px', transition: 'width 0.4s' },
    prog: { fontSize: '0.9rem', color: '#64748b' },
    vid: { width: '100%', borderRadius: '12px', marginBottom: '1.5rem', background: '#000' },
    acts: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    dl: { padding: '1.1rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' as const, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' },
    new: { padding: '1.1rem', background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '12px', color: '#f1f5f9', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
    segmentInfo: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
    segmentBadge: { padding: '0.25rem 0.75rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', fontSize: '0.85rem', color: '#c7d2fe' },
    segmentCount: { fontSize: '0.9rem', color: '#94a3b8' },
    segmentProgress: { display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' as const },
    segmentDot: { width: '24px', height: '24px', borderRadius: '50%', transition: 'background 0.3s' }
}
