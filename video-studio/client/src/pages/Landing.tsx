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
            {/* Ambient Background */}
            <div style={styles.ambientBg}>
                <div style={styles.gradientOrb1} />
                <div style={styles.gradientOrb2} />
                <div style={styles.gradientOrb3} />
            </div>

            <nav style={styles.nav}>
                <div style={styles.navContent}>
                    <div style={styles.logo}>
                        <div style={styles.logoIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M4 8L12 4L20 8V16L12 20L4 16V8Z" stroke="url(#logoGrad)" strokeWidth="2" strokeLinejoin="round"/>
                                <path d="M12 4V20" stroke="url(#logoGrad)" strokeWidth="2"/>
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
                    <div style={styles.badge}>
                        <span style={styles.badgeDot} />
                        Powered by AI & Remotion
                    </div>
                    <h1 style={styles.title}>
                        Create Stunning Videos
                        <br />
                        <span style={styles.gradient}>With Just Words</span>
                    </h1>
                    <p style={styles.subtitle}>
                        Transform your ideas into professional animated videos in seconds.
                        No design skills needed. Just describe what you want.
                    </p>
                    <div style={styles.ctaGroup}>
                        <button style={styles.btnLarge} onClick={() => navigate('/signup')}>
                            Start Creating Free
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                        <button style={styles.btnSecondary} onClick={() => navigate('/login')}>
                            Watch Demo
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div style={styles.statsSection}>
                <div style={styles.statsGrid}>
                    {[
                        { value: '10K+', label: 'Videos Created', icon: '🎬' },
                        { value: '< 30s', label: 'Generation Time', icon: '⚡' },
                        { value: '4K', label: 'Max Resolution', icon: '📺' },
                        { value: '100%', label: 'Free to Start', icon: '🎁' }
                    ].map((stat, i) => (
                        <div key={i} style={styles.statCard}>
                            <span style={styles.statIcon}>{stat.icon}</span>
                            <div style={styles.statValue}>{stat.value}</div>
                            <div style={styles.statLabel}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div style={styles.features}>
                <div style={styles.featuresContent}>
                    <div style={styles.sectionHeader}>
                        <span style={styles.sectionBadge}>Features</span>
                        <h2 style={styles.sectionTitle}>Everything you need to create</h2>
                        <p style={styles.sectionDesc}>Professional video creation tools powered by cutting-edge AI</p>
                    </div>
                    <div style={styles.featuresGrid}>
                        {[
                            { icon: '🤖', title: 'AI Generation', desc: 'Describe your video in plain English and watch AI bring it to life' },
                            { icon: '📋', title: 'Templates', desc: 'Start with professionally designed templates for any platform' },
                            { icon: '🎨', title: 'Customization', desc: 'Fine-tune colors, animations, and timing to match your brand' },
                            { icon: '📱', title: 'Platform Presets', desc: 'One-click optimization for YouTube, TikTok, Instagram & more' },
                            { icon: '⚡', title: 'Lightning Fast', desc: 'Generate videos in seconds, not hours. No rendering queues' },
                            { icon: '🎬', title: 'Multi-Segment', desc: 'Create longer videos with automatic scene transitions' }
                        ].map((feature, i) => (
                            <div key={i} style={styles.featureCard}>
                                <div style={styles.featureIcon}>{feature.icon}</div>
                                <h3 style={styles.featureTitle}>{feature.title}</h3>
                                <p style={styles.featureDesc}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div style={styles.ctaSection}>
                <div style={styles.ctaContent}>
                    <h2 style={styles.ctaTitle}>Ready to create amazing videos?</h2>
                    <p style={styles.ctaDesc}>Join thousands of creators using VideoAI to bring their ideas to life</p>
                    <button style={styles.ctaBtn} onClick={() => navigate('/signup')}>
                        Get Started Free
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <div style={styles.footerLogo}>
                        <span style={styles.logoText}>VideoAI</span>
                        <span style={styles.footerTagline}>Create magic with AI</span>
                    </div>
                    <div style={styles.footerLinks}>
                        <span style={styles.footerLink}>© 2024 VideoAI Studio</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#09090b',
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
        top: '-30%',
        right: '-20%',
        width: '70%',
        height: '70%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
        filter: 'blur(80px)'
    },
    gradientOrb2: {
        position: 'absolute',
        bottom: '-30%',
        left: '-20%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
        filter: 'blur(80px)'
    },
    gradientOrb3: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.06) 0%, transparent 70%)',
        filter: 'blur(100px)'
    },
    nav: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(9, 9, 11, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        zIndex: 100
    },
    navContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    logoIcon: {
        width: '36px',
        height: '36px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    logoText: {
        fontSize: '20px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #818cf8, #c084fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    navButtons: {
        display: 'flex',
        gap: '12px'
    },
    btnGhost: {
        padding: '10px 20px',
        background: 'transparent',
        color: '#a1a1aa',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500
    },
    btnPrimary: {
        padding: '10px 20px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
    },
    hero: {
        paddingTop: '140px',
        paddingBottom: '80px',
        textAlign: 'center' as const,
        maxWidth: '900px',
        margin: '0 auto',
        padding: '140px 24px 80px',
        position: 'relative',
        zIndex: 10
    },
    heroContent: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center'
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '100px',
        fontSize: '13px',
        color: '#a1a1aa',
        marginBottom: '24px'
    },
    badgeDot: {
        width: '6px',
        height: '6px',
        background: '#10b981',
        borderRadius: '50%'
    },
    title: {
        fontSize: 'clamp(40px, 6vw, 72px)',
        fontWeight: 800,
        lineHeight: 1.1,
        marginBottom: '24px',
        color: '#fafafa'
    },
    gradient: {
        background: 'linear-gradient(135deg, #818cf8 0%, #22d3ee 50%, #c084fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    },
    subtitle: {
        fontSize: '18px',
        color: '#71717a',
        marginBottom: '40px',
        maxWidth: '600px',
        lineHeight: 1.7
    },
    ctaGroup: {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap' as const,
        justifyContent: 'center'
    },
    btnLarge: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '16px 28px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white',
        border: 'none',
        borderRadius: '14px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 600,
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.35)'
    },
    btnSecondary: {
        padding: '16px 28px',
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#e4e4e7',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '14px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 600
    },

    statsSection: {
        padding: '0 24px 80px',
        position: 'relative',
        zIndex: 10
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        maxWidth: '900px',
        margin: '0 auto'
    },
    statCard: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '8px',
        padding: '28px 20px',
        background: 'rgba(24, 24, 27, 0.5)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '20px'
    },
    statIcon: {
        fontSize: '28px'
    },
    statValue: {
        fontSize: '28px',
        fontWeight: 800,
        color: '#fafafa'
    },
    statLabel: {
        fontSize: '14px',
        color: '#71717a'
    },
    features: {
        padding: '100px 24px',
        background: 'rgba(24, 24, 27, 0.3)',
        position: 'relative',
        zIndex: 10
    },
    featuresContent: {
        maxWidth: '1200px',
        margin: '0 auto'
    },
    sectionHeader: {
        textAlign: 'center' as const,
        marginBottom: '60px'
    },
    sectionBadge: {
        display: 'inline-block',
        padding: '8px 16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '100px',
        fontSize: '13px',
        color: '#c7d2fe',
        fontWeight: 600,
        marginBottom: '20px'
    },
    sectionTitle: {
        fontSize: '36px',
        fontWeight: 800,
        marginBottom: '16px',
        color: '#fafafa'
    },
    sectionDesc: {
        fontSize: '18px',
        color: '#71717a',
        maxWidth: '500px',
        margin: '0 auto'
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
    },
    featureCard: {
        padding: '32px',
        background: 'rgba(24, 24, 27, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '20px'
    },
    featureIcon: {
        fontSize: '36px',
        marginBottom: '20px'
    },
    featureTitle: {
        fontSize: '18px',
        fontWeight: 700,
        marginBottom: '12px',
        color: '#fafafa'
    },
    featureDesc: {
        fontSize: '15px',
        color: '#71717a',
        lineHeight: 1.6
    },
    ctaSection: {
        padding: '100px 24px',
        textAlign: 'center' as const,
        position: 'relative',
        zIndex: 10
    },
    ctaContent: {
        maxWidth: '600px',
        margin: '0 auto'
    },
    ctaTitle: {
        fontSize: '36px',
        fontWeight: 800,
        marginBottom: '16px',
        color: '#fafafa'
    },
    ctaDesc: {
        fontSize: '18px',
        color: '#71717a',
        marginBottom: '32px'
    },
    ctaBtn: {
        padding: '18px 36px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white',
        border: 'none',
        borderRadius: '14px',
        cursor: 'pointer',
        fontSize: '17px',
        fontWeight: 700,
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.35)'
    },
    footer: {
        padding: '40px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        position: 'relative',
        zIndex: 10
    },
    footerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap' as const,
        gap: '20px'
    },
    footerLogo: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px'
    },
    footerTagline: {
        fontSize: '13px',
        color: '#52525b'
    },
    footerLinks: {
        display: 'flex',
        gap: '24px'
    },
    footerLink: {
        fontSize: '14px',
        color: '#52525b'
    }
}
