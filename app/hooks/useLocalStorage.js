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
        const item = localStorage.getItem(key);
        try {
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`Error parsing localStorage item "${key}":`, e);
            return defaultValue; // Return default value on parse failure
        }
    }, []);

    // Set an item in localStorage with JSON stringification
    const setItem = useCallback((key, value) => {
        if (typeof window === 'undefined') return; // Handle server-side rendering
        localStorage.setItem(key, JSON.stringify(value));
    }, []);

    return { getItem, setItem };
}