import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Use the functional update form of setState to get the latest state
            setStoredValue(currentStoredValue => {
                const valueToStore = value instanceof Function ? value(currentStoredValue) : value;
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
                return valueToStore;
            });
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key]);

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            // Check if the change happened in the same storage area and for the same key
            if (event.storageArea === window.localStorage && event.key === key) {
                try {
                    if (event.newValue) {
                        // The value was changed in another tab
                        setStoredValue(JSON.parse(event.newValue));
                    } else {
                        // The value was cleared in another tab, reset to initial
                        setStoredValue(initialValue);
                    }
                } catch (error) {
                    console.error(`Error parsing storage event value for key "${key}":`, error);
                }
            }
        };

        // Add the event listener for storage changes
        window.addEventListener('storage', handleStorageChange);
        
        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, initialValue]);

    return [storedValue, setValue];
}

export default useLocalStorage;
