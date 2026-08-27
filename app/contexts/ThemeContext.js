'use client';

// ThemeContext.js: Tracks light/dark mode and keeps it in localStorage

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ darkMode: false, toggleDarkMode: () => { } });

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // The inline script in layout.js applies the class before first paint,
        // so read back from the DOM rather than from localStorage again.
        setDarkMode(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleDarkMode = useCallback(() => {
        const next = !darkMode;
        setDarkMode(next);
        document.documentElement.classList.toggle('dark', next);
        try {
            localStorage.setItem('theme', next ? 'dark' : 'light');
        } catch {
            // Private browsing or a full quota: the toggle still works for this session.
        }
    }, [darkMode]);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
