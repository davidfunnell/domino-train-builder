'use client';

// Domino.js: A reusable component to display a single domino tile with a delete button

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Renders a domino tile with head (h) and tail (t) values and a delete button.
 * @param {number} h - The head value of the domino.
 * @param {number} t - The tail value of the domino.
 * @param {function} onDelete - Callback to remove the domino when the delete button is clicked.
 */
export default function Domino({ h, t, onDelete }) {
    const { darkMode } = useTheme();

    return (
        <div className="relative inline-block mx-2">
            {/* Domino tile with two sections for head and tail */}
            <div className="flex w-16 h-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm">
                <div className="flex-1 flex items-center justify-center border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-medium">
                    {h}
                </div>
                <div className="flex-1 flex items-center justify-center text-gray-800 dark:text-gray-200 font-medium">
                    {t}
                </div>
            </div>
            {/* Delete button positioned at the top-right corner */}
            <button
                onClick={() => onDelete(h, t)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
            >
                X
            </button>
        </div>
    );
}