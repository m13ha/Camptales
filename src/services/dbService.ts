import type { SavedStory, Character, HistoryItem, AppSetting } from '../types';

const DB_NAME = 'bedtales-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBDatabase> | null = null;

const initDB = (): Promise<IDBDatabase> => {
    if (dbPromise) {
        return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject('Error opening database');
            dbPromise = null;
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('stories')) {
                db.createObjectStore('stories', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('history')) {
                db.createObjectStore('history', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('characters')) {
                db.createObjectStore('characters', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'id' });
            }
        };
    });

    return dbPromise;
};

type StoreName = 'stories' | 'history' | 'characters' | 'settings';
type StoreType = SavedStory | HistoryItem | Character | AppSetting;

export const getAll = async <T extends StoreType>(storeName: StoreName): Promise<T[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as T[]);
    });
};

export const add = async <T extends StoreType>(storeName: StoreName, item: T): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item); // Use put to add or update
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};

export const remove = async (storeName: StoreName, key: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};

export const removeMultiple = async (storeName: StoreName, keys: string[]): Promise<void> => {
    const db = await initDB();
    if (keys.length === 0) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        keys.forEach(key => {
            store.delete(key);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};