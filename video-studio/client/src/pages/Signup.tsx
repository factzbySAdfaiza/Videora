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

        const success = await signup(name, email, password)
        if (success) {
            navigate('/dashboard')
        } else {
            setError('An account with this email already exists')
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logo} onClick={() => navigate('/')}>
                    <span style={styles.logoIcon}>▶</span>
                    <span style={styles.logoText}>VideoAI</span>
                </div>
                <h1 style={styles.title}>Create your account</h1>
                <p style={styles.subtitle}>Start creating amazing videos</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
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
                    <button type="submit" style={styles.button}>
                        Create Account
                    </button>
                </form>

                <p style={styles.switchText}>
                    Already have an account?{' '}
                    <span onClick={() => navigate('/login')} style={styles.link}>
                        Log in
                    </span>
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
        padding: '1.5rem',
        background: 'radial-gradient(ellipse 50% 50% at 50% 0%, rgba(99, 102, 241, 0.3), transparent), #0a0a0f',
        fontFamily: "'Inter', sans-serif",
        color: '#f1f5f9',
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        padding: '3rem',
        background: '#12121a',
        border: '1px solid #2a2a3a',
        borderRadius: '16px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        cursor: 'pointer',
    },
    logoIcon: {
        fontSize: '1.5rem',
        color: '#6366f1',
    },
    logoText: {
        fontSize: '1.25rem',
        fontWeight: 700,
    },
    title: {
        textAlign: 'center',
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '0.25rem',
    },
    subtitle: {
        textAlign: 'center',
        color: '#94a3b8',
        marginBottom: '2rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#94a3b8',
    },
    input: {
        padding: '0.75rem 1rem',
        background: '#1a1a24',
        border: '1px solid #2a2a3a',
        borderRadius: '10px',
        color: '#f1f5f9',
        fontSize: '0.875rem',
        outline: 'none',
    },
    error: {
        color: '#ef4444',
        fontSize: '0.75rem',
    },
    button: {
        padding: '0.75rem 1rem',
        background: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    },
    switchText: {
        textAlign: 'center',
        marginTop: '1.5rem',
        color: '#94a3b8',
        fontSize: '0.875rem',
    },
    link: {
        color: '#6366f1',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
}
