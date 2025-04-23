'use client';

// Settings.js: Provides a dropdown to change the maximum domino value

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Renders a dropdown for selecting the maximum domino value (e.g., 9, 12, 15, 18).
 * @param {number} maxValue - Current maximum domino value.
 * @param {function} onMaxValueChange - Callback to handle max value changes.
 */
export default function Settings({ maxValue, onMaxValueChange }) {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <div className="fixed bottom-16 right-6 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-5">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Domino Set Size
                </label>
                <select
                    value={maxValue}
                    onChange={onMaxValueChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                    <option value={15}>15</option>
                    <option value={18}>18</option>
                </select>
            </div>

            <div>
                <label className="flex items-center cursor-pointer">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                        Dark Mode
                    </span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={darkMode}
                            onChange={toggleDarkMode}
                        />
                        <div className={`w-10 h-5 bg-gray-300 dark:bg-blue-600 rounded-full shadow-inner ${darkMode ? 'bg-blue-500' : ''}`}></div>
                        <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full transition transform ${darkMode ? 'translate-x-5' : ''} shadow`}></div>
                    </div>
                </label>
            </div>
        </div>
    );
}