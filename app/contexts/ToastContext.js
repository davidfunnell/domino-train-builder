'use client'
// ToastContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);

    // Auto-hide the toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 3000);
            return () => clearTimeout(timer); // Cleanup timer on unmount or toast change
        }
    }, [toast]);

    // Function to trigger a toast with a message and type
    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div
                    className={`fixed bottom-5 left-6 p-4 rounded shadow-lg text-white cursor-pointer ${toast.type === 'success'
                        ? 'bg-green-500'
                        : toast.type === 'error'
                            ? 'bg-red-500'
                            : 'bg-gray-800'
                        }`}
                    onClick={() => setToast(null)} // Dismiss on click
                >
                    {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}