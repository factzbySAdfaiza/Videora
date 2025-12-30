import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
    email: string
    name: string
}

interface AuthContextType {
    user: User | null
    coins: number
    login: (email: string, password: string) => Promise<boolean>
    signup: (name: string, email: string, password: string) => Promise<boolean>
    logout: () => void
    deductCoins: (amount: number) => void
    addCoins: (amount: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TEST_USER = {
    email: 'test@test.com',
    password: 'password123',
    name: 'Test User'
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [coins, setCoins] = useState<number>(1000)

    useEffect(() => {
        const session = sessionStorage.getItem('videoai_session')
        const savedCoins = localStorage.getItem('videoai_coins')

        if (session) {
            try {
                setUser(JSON.parse(session))
            } catch (e) {
                sessionStorage.removeItem('videoai_session')
            }
        }

        if (savedCoins) {
            const parsedCoins = parseInt(savedCoins)
            if (parsedCoins === 0) {
                setCoins(1000)
                localStorage.setItem('videoai_coins', '1000')
            } else {
                setCoins(parsedCoins)
            }
        }
    }, [])

    const login = async (email: string, password: string): Promise<boolean> => {
        if (email === TEST_USER.email && password === TEST_USER.password) {
            const userData = { email: TEST_USER.email, name: TEST_USER.name }
            setUser(userData)
            sessionStorage.setItem('videoai_session', JSON.stringify(userData))
            return true
        }

        const users = JSON.parse(localStorage.getItem('videoai_users') || '{}')
        const storedUser = users[email]

        if (storedUser && storedUser.password === btoa(password)) {
            const userData = { email: storedUser.email, name: storedUser.name }
            setUser(userData)
            sessionStorage.setItem('videoai_session', JSON.stringify(userData))
            return true
        }

        return false
    }

    const signup = async (name: string, email: string, password: string): Promise<boolean> => {
        const users = JSON.parse(localStorage.getItem('videoai_users') || '{}')

        if (users[email]) {
            return false
        }

        users[email] = {
            name,
            email,
            password: btoa(password),
            createdAt: new Date().toISOString()
        }

        localStorage.setItem('videoai_users', JSON.stringify(users))

        const userData = { email, name }
        setUser(userData)
        sessionStorage.setItem('videoai_session', JSON.stringify(userData))
        return true
    }

    const logout = () => {
        setUser(null)
        sessionStorage.removeItem('videoai_session')
    }

    const deductCoins = (amount: number) => {
        const newBalance = Math.max(0, coins - amount)
        setCoins(newBalance)
        localStorage.setItem('videoai_coins', newBalance.toString())
    }

    const addCoins = (amount: number) => {
        const newBalance = coins + amount
        setCoins(newBalance)
        localStorage.setItem('videoai_coins', newBalance.toString())
    }

    return (
        <AuthContext.Provider value={{ user, coins, login, signup, logout, deductCoins, addCoins }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
