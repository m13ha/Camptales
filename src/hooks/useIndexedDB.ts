import { useState, useEffect, useCallback } from 'react';
import { getAll, add, remove, removeMultiple } from '../services/dbService';
// FIX: Import specific types to create a stronger constraint for the generic hook.
import type { SavedStory, Character, HistoryItem, AppSetting } from '../types';

type StoreName = 'stories' | 'history' | 'characters' | 'settings';
// FIX: The previous DBItem interface was too generic and did not satisfy the type constraints
// of the dbService functions. This union type ensures type safety.
type DBItem = SavedStory | Character | HistoryItem | AppSetting;

export function useIndexedDB<T extends DBItem>(storeName: StoreName) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            try {
                setLoading(true);
                const result = await getAll<T>(storeName);
                if (isMounted) {
                    setData(result);
                }
            } catch (err) {
                 if (isMounted) {
                    setError(`Failed to load data from ${storeName}`);
                    console.error(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        fetchData();
        return () => { isMounted = false; };
    }, [storeName]);

    const addItem = useCallback(async (item: T) => {
        try {
            await add(storeName, item);
            setData(prev => [item, ...prev.filter(p => p.id !== item.id)]);
        } catch (err) {
            setError(`Failed to add item to ${storeName}`);
            console.error(err);
            throw err;
        }
    }, [storeName]);

    const deleteItem = useCallback(async (id: string) => {
        try {
            await remove(storeName, id);
            setData(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            setError(`Failed to delete item from ${storeName}`);
            console.error(err);
            throw err;
        }
    }, [storeName]);

    const deleteMultipleItems = useCallback(async (ids: string[]) => {
        try {
            await removeMultiple(storeName, ids);
            setData(prev => prev.filter(item => !ids.includes(item.id)));
        } catch (err) {
            setError(`Failed to delete multiple items from ${storeName}`);
            console.error(err);
            throw err;
        }
    }, [storeName]);

    return { data, loading, error, addItem, deleteItem, deleteMultipleItems };
}