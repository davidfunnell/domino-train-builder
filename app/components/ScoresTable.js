'use client';

// ScoresTable.js: Displays and manages the scores table for players

import React from 'react';

/**
 * Renders a table to display and edit player scores for each round.
 * @param {array} players - Array of player objects with name and scores.
 * @param {array} rounds - Array of round numbers (e.g., [12, 11, ..., 0]).
 * @param {function} handleScoreChange - Callback to update a player’s score.
 * @param {function} removePlayer - Callback to remove a player.
 */
export default function ScoresTable({ players, rounds, handleScoreChange, removePlayer }) {
    return (
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 overflow-x-auto mb-20">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Round
                        </th>
                        {players.map((player) => (
                            <th
                                key={player.name}
                                className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {player.name}
                                <button
                                    onClick={() => removePlayer(player.name)}
                                    className="ml-2 text-red-500 hover:text-red-600"
                                >
                                    x
                                </button>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {rounds.map((round) => (
                        <tr key={round}>
                            {/* Display round number as a domino-like tile */}
                            <td className="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-700">
                                <div className="relative inline-block py-2">
                                    <div className="flex w-16 h-10 bg-white border border-gray-200 rounded-md shadow-sm">
                                        <div className="flex-1 flex items-center justify-center border-r border-gray-200 text-gray-800 font-medium">
                                            {round}
                                        </div>
                                        <div className="flex-1 flex items-center justify-center text-gray-800 font-medium">
                                            {round}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            {/* Score inputs for each player */}
                            {players.map((player) => (
                                <td key={player.name} className="px-4 py-2 text-center whitespace-nowrap">
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-16 p-1 border rounded text-center text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                        value={player.scores[round]}
                                        onChange={(e) => handleScoreChange(player.name, round, e.target.value)}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gray-50">
                    <tr>
                        <td className="px-4 py-2 whitespace-nowrap text-center font-medium text-gray-700">
                            Total
                        </td>
                        {players.map((player) => (
                            <td
                                key={player.name}
                                className="px-4 py-2 whitespace-nowrap text-center font-medium text-gray-700"
                            >
                                {player.scores.reduce((sum, score) => sum + score, 0)}
                            </td>
                        ))}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}