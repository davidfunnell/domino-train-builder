'use client';

// TotalSum.js: Displays the total sum of all domino values

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Calculates and displays the sum of all head and tail values in the dominoes.
 * @param {array} nodes - Array of [head, tail] pairs representing all dominoes.
 */
export default function TotalSum({ nodes }) {
    const { darkMode } = useTheme();

    // Compute the total sum of all domino values
    const totalSum = nodes.reduce((acc, [h, t]) => acc + h + t, 0);

    return (
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Sum of Dominoes</h2>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalSum}</p>
        </div>
    );
}