import { useState, useEffect } from 'react'

export function useTheme() {
    const [theme, setTheme] = useState(
        () => localStorage.getItem('sp_theme') || 'light'
    )

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('sp_theme', theme)
    }, [theme])

    function toggle() {
        setTheme(t => t === 'light' ? 'dark' : 'light')
    }

    return { theme, toggle }
}