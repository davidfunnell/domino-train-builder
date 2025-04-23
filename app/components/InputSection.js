'use client';

// InputSection.js: Manages user inputs for setting the starting value and adding dominoes

import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Handles the input forms for setting the starting value and adding new dominoes.
 * @param {number} maxValue - Maximum allowed domino value.
 * @param {function} onSetStartingValue - Callback to set the starting value in the parent.
 * @param {function} onAddDomino - Callback to add a new domino in the parent.
 */
export default function InputSection({ maxValue, onSetStartingValue, onAddDomino, startingValue }) {
    // Local state for form inputs and error messages
    const [inputValue, setInputValue] = useState(startingValue);
    const [newHead, setNewHead] = useState('');
    const [newTail, setNewTail] = useState('');
    const [error, setError] = useState('');
    const { darkMode } = useTheme();

    // add context for toast notifications
    const { showToast } = useToast();

    // Refs to manage focus between head and tail inputs
    const headInputRef = useRef(null);
    const tailInputRef = useRef(null);

    useEffect(() => {
        setInputValue(startingValue)
    }, [startingValue]);



    // Handle submission of the starting value form
    const handleSubmit = (e) => {
        e.preventDefault();
        const value = Number(inputValue);
        // Validate the input against maxValue
        if (isNaN(value) || value < 0 || value > maxValue) {
            setError(`Starting value must be between 0 and ${maxValue}`);
            return;
        }
        setError('');
        onSetStartingValue(value);
    };

    // Handle addition of a new domino
    const addDomino = (e) => {
        e.preventDefault();
        const h = Number(newHead);
        const t = Number(newTail);
        // Validate domino values
        if (isNaN(h) || isNaN(t) || h < 0 || h > maxValue || t < 0 || t > maxValue) {
            showToast(`Please enter numbers between 0 and ${maxValue}`, 'error');
            return;
        }
        onAddDomino(h, t);
        // Reset inputs and refocus on head input
        setNewHead('');
        setNewTail('');
        headInputRef.current.focus();
    };

    // Move focus to tail input on Enter key in head input
    const handleHeadKeyPress = (e) => {
        if (e.key === 'Enter' && newHead !== '') {
            tailInputRef.current.focus();
        }
    };

    // Trigger domino addition on Enter key in tail input
    const handleTailKeyPress = (e) => {
        if (e.key === 'Enter' && newTail !== '') {
            addDomino(e);
        }
    };

    return (
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            {/* Starting Value Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Enter starting value (0-${maxValue})`}
                    className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 dark:text-gray-200 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full p-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm"
                >
                    Start Train
                </button>
            </form>

            {/* Add Domino Form */}
            <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Add Domino</h2>
                <form onSubmit={addDomino} className="flex space-x-3">
                    <input
                        ref={headInputRef}
                        type="number"
                        value={newHead}
                        onChange={(e) => setNewHead(e.target.value)}
                        onKeyDown={handleHeadKeyPress}
                        placeholder={`Head (0-${maxValue})`}
                        className="w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 dark:text-gray-200 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    />
                    <input
                        ref={tailInputRef}
                        type="number"
                        value={newTail}
                        onChange={(e) => setNewTail(e.target.value)}
                        onKeyDown={handleTailKeyPress}
                        placeholder={`Tail (0-${maxValue})`}
                        className="w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 dark:text-gray-200 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    />
                    <button
                        type="submit"
                        className="w-1/3 p-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 active:bg-green-800 transition-all shadow-sm"
                    >
                        Add
                    </button>
                </form>
            </div>
        </div>
    );
}