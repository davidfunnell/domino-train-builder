'use client';

// Settings.js: Provides a dropdown to change the maximum domino value

import React from 'react';

/**
 * Renders a dropdown for selecting the maximum domino value (e.g., 9, 12, 15, 18).
 * @param {number} maxValue - Current maximum domino value.
 * @param {function} onMaxValueChange - Callback to handle max value changes.
 */
export default function Settings({ maxValue, onMaxValueChange }) {
    return (
        <div className="fixed bottom-16 right-6 w-64 bg-white rounded-lg shadow-lg p-4 mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Domino Set Size
            </label>
            <select
                value={maxValue}
                onChange={onMaxValueChange}
                className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            >
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={15}>15</option>
                <option value={18}>18</option>
            </select>
        </div>
    );
}