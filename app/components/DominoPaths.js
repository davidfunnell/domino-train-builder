'use client';

// DominoPaths.js: Displays the computed domino trains starting from a given value

import React from 'react';
import Domino from './Dominos';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Renders all domino paths (trains) computed from the nodes and starting value.
 * @param {array} dominoes - Array of paths, where each path is an array of [h, t] pairs.
 * @param {number} startingValue - The intended starting value for the trains.
 * @param {function} deleteDomino - Callback to remove a domino from the list.
 */
export default function DominoPaths({ dominoes, startingValue, deleteDomino }) {
    const { darkMode } = useTheme();

    return (
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Paths Starting from {startingValue}
            </h2>
            {dominoes.length > 0 ? (
                <>
                    {/* Warn if the first domino doesn't match the starting value */}
                    {dominoes[0][0][0] !== startingValue && (
                        <p className="text-red-500 dark:text-red-400 text-sm mb-3">
                            No paths start with {startingValue}, showing the best possible paths.
                        </p>
                    )}
                    {/* Render each path as a sequence of Domino components */}
                    {dominoes.map((path, index) => (
                        <div key={index} className="flex flex-wrap justify-center my-4">
                            {path.map(([h, t], i) => (
                                <Domino key={i} h={h} t={t} onDelete={deleteDomino} />
                            ))}
                        </div>
                    ))}
                </>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">No paths found.</p>
            )}
        </div>
    );
}