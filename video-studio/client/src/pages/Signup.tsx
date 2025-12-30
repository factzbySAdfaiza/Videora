import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
    const navigate = useNavigate()
    const { signup } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!name || !email || !password) {
            setError('All fields are required')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }
        setLoading(true)
        const success = await signup(name, email, password)
        setLoading(false)
        if (success) {
            navigate('/dashboard')
        } else {
            setError('Email already exists')
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.ambientBg}>
                <div style={styles.gradientOrb1} />
                <div style={styles.gradientOrb2} />
            </div>

            <div style={styles.card}>
                <div style={styles.cardGlow} />
                <div style={styles.logo} onClick={() => navigate('/')}>
                    <div style={styles.logoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M4 8L12 4L20 8V16L12 20L4 16V8Z" stroke="url(#logoGrad)" strokeWidth="2" strokeLinejoin="round"/>
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
                <h1 style={styles.title}>Create account</h1>
                <p style={styles.subtitle}>Start creating amazing videos today</p>

                <div style={styles.bonus}>
                    <span style={styles.bonusIcon}>🎁</span>
                    <span>Get 1,000 free credits on signup!</span>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={styles.input}
                        />
                    </div>
                    {error && <div style={styles.error}>{error}</div>}
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p style={styles.switchText}>
                    Already have an account?{' '}
                    <span onClick={() => navigate('/login')} style={styles.link}>Log in</span>
                </p>
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#09090b',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#fafafa',
        position: 'relative',
        overflow: 'hidden'
    },
    ambientBg: {
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none'
    },
    gradientOrb1: {
        position: 'absolute',
        top: '-30%',
        left: '-20%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
        filter: 'blur(80px)'
    },
    gradientOrb2: {
        position: 'absolute',
        bottom: '-30%',
        right: '-20%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
        filter: 'blur(80px)'
    },
    card: {
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        background: 'rgba(24, 24, 27, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
        zIndex: 10
    },
    cardGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), rgba(99, 102, 241, 0.5), transparent)'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '32px',
        cursor: 'pointer'
    },
    logoIcon: {
        width: '40px',
        height: '40px',
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
    title: {
        textAlign: 'center' as const,
        fontSize: '28px',
        fontWeight: 700,
        marginBottom: '8px',
        color: '#fafafa'
    },
    subtitle: {
        textAlign: 'center' as const,
        color: '#71717a',
        marginBottom: '24px',
        fontSize: '15px'
    },
    bonus: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '14px 20px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 211, 238, 0.1))',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '12px',
        marginBottom: '24px',
        fontSize: '14px',
        color: '#6ee7b7'
    },
    bonusIcon: {
        fontSize: '18px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px'
    },
    label: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#a1a1aa'
    },
    input: {
        padding: '16px 18px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        color: '#fafafa',
        fontSize: '15px',
        outline: 'none'
    },
    error: {
        color: '#f87171',
        fontSize: '13px',
        textAlign: 'center' as const
    },
    button: {
        padding: '16px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
        marginTop: '8px'
    },
    switchText: {
        textAlign: 'center' as const,
        marginTop: '24px',
        color: '#71717a',
        fontSize: '14px'
    },
    link: {
        color: '#818cf8',
        cursor: 'pointer',
        fontWeight: 600
    }
}
