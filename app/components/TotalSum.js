'use client';

// TotalSum.js: Displays the total sum of all domino values

import React from 'react';

/**
 * Calculates and displays the sum of all head and tail values in the dominoes.
 * @param {array} nodes - Array of [head, tail] pairs representing all dominoes.
 */
export default function TotalSum({ nodes }) {
    // Compute the total sum of all domino values
    const totalSum = nodes.reduce((acc, [h, t]) => acc + h + t, 0);

    return (
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Sum of Dominoes</h2>
            <p className="text-2xl font-bold text-blue-600">{totalSum}</p>
        </div>
    );
}