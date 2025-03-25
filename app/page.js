'use client';

// page.js: Main page for the Domino Train Builder

import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { findAllLinkedLists } from './utils/dominoUtils';
import InputSection from './components/InputSection';
import DominoPaths from './components/DominoPaths';
import TotalSum from './components/TotalSum';
import Settings from './components/Settings';
import Link from 'next/link';
import { useToast } from './contexts/ToastContext';

/**
 * The main page component that orchestrates the Domino Train Builder functionality.
 */
export default function Home() {
    // Hook for localStorage operations
    const { getItem, setItem } = useLocalStorage();

    // set variables with initial values from localStorage
    const [startingValue, setStartingValue] = useState(12);
    const [nodes, setNodes] = useState([]);
    const [maxValue, setMaxValue] = useState(12);
    const [dominoes, setDominoes] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [loadedLocalStorage, setLoadedLocalStorage] = useState(false);

    // add context for toast notifications
    const { showToast } = useToast();

    // Load from localStorage only on client-side mount
    useEffect(() => {
        const savedNodes = getItem('nodes', []);
        const savedMaxValue = getItem('maxValue', 12);
        const savedStartingValue = getItem('startingValue', 12)
        setStartingValue(savedStartingValue)
        setNodes(savedNodes);
        setMaxValue(savedMaxValue);
    }, [getItem]);

    // Update domino paths when nodes or startingValue changes
    useEffect(() => {
        if (startingValue !== null) {
            const result = findAllLinkedLists(nodes, startingValue);
            setDominoes(result);
        } else {
            setDominoes([]);
        }
        setLoadedLocalStorage(true);
    }, [nodes, startingValue]);

    // Sync state with localStorage
    useEffect(() => {
        if (loadedLocalStorage) {
            setItem('startingValue', startingValue);
            setItem('nodes', nodes);
            setItem('maxValue', maxValue);
        }
    }, [startingValue, nodes, maxValue, setItem, loadedLocalStorage]);

    // Set the starting value for the train
    const handleSetStartingValue = (value) => {
        setStartingValue(value);
    };

    // Add a new domino to the nodes list
    const addDomino = (h, t) => {
        const exists = nodes.some(
            ([a, b]) => (a === h && b === t) || (a === t && b === h)
        );
        if (exists) {
            showToast('Domino already exists', 'error');
            return;
        }
        setNodes((prev) => [...prev, [h, t]]);
        setLoadedLocalStorage(true);
    };

    // Delete a domino from the nodes list
    const deleteDomino = (h, t) => {
        setNodes((prevNodes) => {
            const newNodes = prevNodes.filter(
                ([head, tail]) => !(head === h && tail === t) && !(head === t && tail === h)
            );
            // Update startingValue if the deleted domino affects the longest train
            if (
                startingValue !== null &&
                dominoes.length > 0 &&
                dominoes[0].length > 0
            ) {
                const longestTrain = dominoes[0];
                const headDomino = longestTrain[0];
                if (
                    (headDomino[0] === h && headDomino[1] === t) ||
                    (headDomino[0] === t && headDomino[1] === h)
                ) {
                    const newStartingValue = headDomino[1];
                    setStartingValue(newStartingValue);
                }
            }
            return newNodes;
        });
        setLoadedLocalStorage(true);
    };

    // Handle maxValue change from settings
    const handleMaxValueChange = (e) => {
        setMaxValue(Number(e.target.value));
        setShowSettings(false);
        setLoadedLocalStorage(true);
    };

    // Reset all state and clear localStorage
    const resetState = () => {
        setNodes([]);
        setDominoes([]);
        setShowSettings(false);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('nodes');
            localStorage.removeItem('startingValue');
            localStorage.removeItem('maxValue');
        }
        setLoadedLocalStorage(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center justify-center p-6 font-sans">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">
                Domino Train Builder
            </h1>

            <InputSection
                maxValue={maxValue}
                onSetStartingValue={handleSetStartingValue}
                onAddDomino={addDomino}
                startingValue={startingValue}
            />

            {startingValue !== null && (
                <DominoPaths
                    dominoes={dominoes}
                    startingValue={startingValue}
                    deleteDomino={deleteDomino}
                />
            )}

            <TotalSum nodes={nodes} />

            {/* Navigation and control buttons */}
            <div className="fixed bottom-6 right-6 flex space-x-4">
                <Link href="/scores">
                    <button className="p-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md">
                        Scores
                    </button>
                </Link>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md"
                >
                    Settings
                </button>
                <button
                    onClick={resetState}
                    className="p-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-all shadow-md"
                >
                    Reset
                </button>
            </div>

            {/* Settings dropdown */}
            {showSettings && (
                <Settings maxValue={maxValue} onMaxValueChange={handleMaxValueChange} />
            )}
        </div>
    );
}