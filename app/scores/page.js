'use client';

// scores/page.js: Page for managing and displaying player scores

import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ScoresTable from '../components/ScoresTable';
import Settings from '../components/Settings';
import Link from 'next/link';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';

/**
 * The scores page component for tracking player scores in the Mexican Train game.
 */
export default function Scores() {
    const { getItem, setItem } = useLocalStorage();
    const { darkMode } = useTheme();

    // Initialize state with defaults for consistent server/client rendering
    const [maxValue, setMaxValue] = useState(12);
    const [players, setPlayers] = useState([]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [loadedLocalStorage, setLoadedLocalStorage] = useState(false);

    // add context for toast notifications
    const { showToast } = useToast();

    // Load from localStorage only on client-side mount
    useEffect(() => {
        const savedMaxValue = getItem('maxValue', 12);
        const savedPlayers = getItem('players', []);
        setMaxValue(savedMaxValue);
        setPlayers(savedPlayers);
    }, [getItem]);

    // Sync state with localStorage when players or maxValue change
    useEffect(() => {
        if (loadedLocalStorage) {
            setItem('players', players);
            setItem('maxValue', maxValue);
        }
    }, [players, maxValue, setItem, loadedLocalStorage]);

    // Add a new player with an initialized scores array
    const addPlayer = () => {
        const name = newPlayerName.trim();
        if (name && !players.some((p) => p.name === name)) {
            const newPlayer = { name, scores: Array(maxValue + 1).fill(0) };
            setPlayers((prev) => [...prev, newPlayer]);
            setNewPlayerName('');
        } else if (players.some((p) => p.name === name)) {
            showToast('Player name already exists.', 'error');
        }
        setLoadedLocalStorage(true);
    };

    // Remove a player by name
    const removePlayer = (name) => {
        setPlayers((prev) => prev.filter((p) => p.name !== name));
        setLoadedLocalStorage(true);
    };

    // Update a player's score for a specific round
    const handleScoreChange = (playerName, round, value) => {
        setPlayers((prevPlayers) => {
            const newPlayers = prevPlayers.map((p) => {
                if (p.name === playerName) {
                    const newScores = [...p.scores];
                    newScores[round] = parseInt(value) || 0;
                    return { ...p, scores: newScores };
                }
                return p;
            });
            return newPlayers;
        });
        setLoadedLocalStorage(true);
    };

    // Reset all player scores to zero
    const resetGame = () => {
        setPlayers((prevPlayers) =>
            prevPlayers.map((player) => ({
                ...player,
                scores: Array(maxValue + 1).fill(0),
            }))
        );
    };

    // Handle maxValue change and adjust player scores accordingly
    const handleMaxValueChange = (e) => {
        const newMaxValue = Number(e.target.value);
        setMaxValue(newMaxValue);
        setPlayers((prevPlayers) => {
            return prevPlayers.map((player) => {
                const currentScores = player.scores || [];
                const newScores = Array(newMaxValue + 1).fill(0);
                currentScores.forEach((score, index) => {
                    if (index <= newMaxValue) {
                        newScores[index] = score;
                    }
                });
                return { ...player, scores: newScores };
            });
        });
        setShowSettings(false);
        setLoadedLocalStorage(true);
    };

    // Generate rounds array from maxValue to 0
    const rounds = Array.from({ length: maxValue + 1 }, (_, i) => maxValue - i);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-6 font-sans">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">
                Mexican Train Scores
            </h1>

            {/* Player addition form */}
            <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder="Enter player name"
                        className="w-2/3 p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 dark:text-gray-200 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    />
                    <button
                        onClick={addPlayer}
                        className="w-1/3 p-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-all shadow-sm"
                    >
                        Add Player
                    </button>
                </div>
            </div>

            {/* Scores table */}
            {players.length > 0 && (
                <ScoresTable
                    players={players}
                    rounds={rounds}
                    handleScoreChange={handleScoreChange}
                    removePlayer={removePlayer}
                />
            )}

            {/* Navigation and control buttons */}
            <div className="fixed bottom-6 right-6 flex space-x-4">
                <Link href="/">
                    <button className="p-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md">
                        Train Builder
                    </button>
                </Link>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md"
                >
                    Settings
                </button>
                <button
                    onClick={resetGame}
                    className="p-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-all shadow-md"
                >
                    Reset Game
                </button>
            </div>

            {/* Settings dropdown */}
            {showSettings && (
                <Settings maxValue={maxValue} onMaxValueChange={handleMaxValueChange} />
            )}
        </div>
    );
}