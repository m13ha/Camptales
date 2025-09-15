import { useState, useEffect } from 'react';

/**
 * Custom hook to manage state that persists in localStorage.
 * @param key The key to use for storing the value in localStorage.
 * @param initialValue The initial value to use if nothing is stored for the key.
 * @returns A stateful value, and a function to update it.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            // If setting fails, we can't do much, so we'll just ignore it.
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
