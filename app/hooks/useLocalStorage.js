// useLocalStorage.js: Custom hook for managing localStorage operations

import { useCallback } from 'react';

/**
 * Provides functions to get and set items in localStorage with JSON parsing.
 * @returns {object} - Contains getItem and setItem functions.
 */
export function useLocalStorage() {
    // Retrieve an item from localStorage with a default value
    const getItem = useCallback((key, defaultValue) => {
        if (typeof window === 'undefined') return defaultValue; // Handle server-side rendering
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            // Unparseable value, or storage blocked entirely (private browsing).
            console.error(`Error reading localStorage item "${key}":`, e);
            return defaultValue;
        }
    }, []);

    // Set an item in localStorage with JSON stringification
    const setItem = useCallback((key, value) => {
        if (typeof window === 'undefined') return; // Handle server-side rendering
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            // Quota exceeded or storage blocked: the app still works in-session.
            console.error(`Error writing localStorage item "${key}":`, e);
        }
    }, []);

    return { getItem, setItem };
}
