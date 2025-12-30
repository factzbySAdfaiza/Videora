import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Landing() {
    const navigate = useNavigate()
    const { user } = useAuth()

    if (user) {
        navigate('/dashboard')
    }

    return (
        <div style={styles.page}>
            <nav style={styles.nav}>
                <div style={styles.navContent}>
                    <div style={styles.logo}>
                        <span style={styles.logoIcon}>▶</span>
                        <span style={styles.logoText}>VideoAI</span>
                    </div>
                    <div style={styles.navButtons}>
                        <button style={styles.btnGhost} onClick={() => navigate('/login')}>
                            Log in
                        </button>
                        <button style={styles.btnPrimary} onClick={() => navigate('/signup')}>
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            <div style={styles.hero}>
                <div style={styles.heroContent}>
                    <div style={styles.badge}>✨ Powered by AI</div>
                    <h1 style={styles.title}>
                        Create Stunning Videos<br />
                        <span style={styles.gradient}>In Seconds</span>
                    </h1>
                    <p style={styles.subtitle}>
                        Transform your ideas into professional animated videos using AI. No design skills required.
                    </p>
                    <div style={styles.ctaGroup}>
                        <button style={styles.btnLarge} onClick={() => navigate('/signup')}>
                            Start Creating Free →
                        </button>
                    </div>
                    <div style={styles.stats}>
                        <div style={styles.stat}>
                            <div style={styles.statValue}>10K+</div>
                            <div style={styles.statLabel}>Videos Created</div>
                        </div>
                        <div style={styles.stat}>
                            <div style={styles.statValue}>5s</div>
                            <div style={styles.statLabel}>Avg. Generation</div>
                        </div>
                        <div style={styles.stat}>
                            <div style={styles.statValue}>Free</div>
                            <div style={styles.statLabel}>To Start</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.features}>
                <h2 style={styles.sectionTitle}>Why Choose VideoAI?</h2>
                <div style={styles.grid}>
                    {[
                        { icon: '🎨', title: 'AI-Powered', desc: 'Just describe your video in plain English' },
                        { icon: '⚡', title: 'Lightning Fast', desc: 'Generate videos in seconds, not hours' },
                        { icon: '🎬', title: 'HD Quality', desc: 'Export in 1080p HD for professional use' },
                        { icon: '💰', title: 'Cost Effective', desc: 'No expensive software needed' },
                    ].map((feature, i) => (
                        <div key={i} style={styles.card}>
                            <div style={styles.icon}>{feature.icon}</div>
                            <h3 style={styles.cardTitle}>{feature.title}</h3>
                            <p style={styles.cardDesc}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        color: '#f1f5f9',
        fontFamily: "'Inter', sans-serif",
    },
    nav: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #2a2a3a',
        zIndex: 100,
    },
    navContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    logoIcon: {
        fontSize: '1.5rem',
        color: '#6366f1',
    },
    logoText: {
        fontSize: '1.25rem',
        fontWeight: 700,
    },
    navButtons: {
        display: 'flex',
        gap: '1rem',
    },
    btnGhost: {
        padding: '0.625rem 1.25rem',
        background: 'transparent',
        color: '#94a3b8',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
    },
    btnPrimary: {
        padding: '0.625rem 1.25rem',
        background: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    },
    hero: {
        paddingTop: '120px',
        paddingBottom: '4rem',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto',
        padding: '120px 1.5rem 4rem',
    },
    heroContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    badge: {
        display: 'inline-block',
        padding: '0.375rem 0.875rem',
        background: '#1a1a24',
        border: '1px solid #2a2a3a',
        borderRadius: '100px',
        fontSize: '0.75rem',
        marginBottom: '1.5rem',
    },
    title: {
        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
        fontWeight: 800,
        lineHeight: 1.1,
        marginBottom: '1.5rem',
    },
    gradient: {
        background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    subtitle: {
        fontSize: '1.125rem',
        color: '#94a3b8',
        marginBottom: '2rem',
        maxWidth: '600px',
    },
    ctaGroup: {
        marginBottom: '3rem',
    },
    btnLarge: {
        padding: '0.875rem 1.75rem',
        background: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    },
    stats: {
        display: 'flex',
        gap: '3rem',
        justifyContent: 'center',
    },
    stat: {
        textAlign: 'center',
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 700,
    },
    statLabel: {
        fontSize: '0.75rem',
        color: '#64748b',
    },
    features: {
        padding: '4rem 1.5rem',
        backgroundColor: '#12121a',
    },
    sectionTitle: {
        fontSize: '2rem',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: '3rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    card: {
        padding: '2rem',
        background: '#1a1a24',
        border: '1px solid #2a2a3a',
        borderRadius: '16px',
    },
    icon: {
        fontSize: '2rem',
        marginBottom: '1rem',
    },
    cardTitle: {
        fontSize: '1.125rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
    },
    cardDesc: {
        color: '#94a3b8',
        fontSize: '0.875rem',
    },
}
