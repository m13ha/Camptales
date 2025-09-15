import { useState, useEffect, useCallback } from 'react';
import { getAll, add } from '../services/dbService';
import type { ApiUsage, SavedStory, Character } from '../types';

export type ActionType = 'createStory' | 'createCharacter';

const DAILY_LIMITS: Record<ActionType, number> = {
  createStory: 2,
  createCharacter: 2,
};

type Limits = Record<ActionType, { count: number; lastReset: string }>;

const getToday = (): string => new Date().toISOString().split('T')[0];

const initialLimitsState: Limits = {
    createStory: { count: 0, lastReset: getToday() },
    createCharacter: { count: 0, lastReset: getToday() },
};


export const useApiRateLimiter = () => {
    const [limits, setLimits] = useState<Limits>(initialLimitsState);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const synchronizeLimits = async () => {
            const today = getToday();
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            try {
                // Layer 1: Local Storage
                let lsStoryCount = 0;
                let lsCharCount = 0;
                try {
                    const item = window.localStorage.getItem('apiRateLimits');
                    if (item) {
                        const stored = JSON.parse(item) as Limits;
                        if (stored.createStory?.lastReset === today) {
                            lsStoryCount = stored.createStory.count;
                        }
                        if (stored.createCharacter?.lastReset === today) {
                            lsCharCount = stored.createCharacter.count;
                        }
                    }
                } catch { /* Ignore LS parsing errors */ }

                // Layer 2: IndexedDB `apiUsage` store
                let dbUsageStoryCount = 0;
                let dbUsageCharCount = 0;
                const dbUsages = await getAll<ApiUsage>('apiUsage');
                const storyUsage = dbUsages.find(u => u.id === 'createStory');
                const charUsage = dbUsages.find(u => u.id === 'createCharacter');

                if (storyUsage && storyUsage.lastReset === today) {
                    dbUsageStoryCount = storyUsage.count;
                }
                if (charUsage && charUsage.lastReset === today) {
                    dbUsageCharCount = charUsage.count;
                }

                // Layer 3: Fallback check of created items
                const [allStories, allCharacters] = await Promise.all([
                    getAll<SavedStory>('stories'),
                    getAll<Character>('characters'),
                ]);
                
                const recentStories = allStories.filter(s => s.createdAt > oneDayAgo).length;
                const recentChars = allCharacters.filter(c => c.createdAt > oneDayAgo).length;

                // Synthesize the true counts
                const finalStoryCount = Math.max(lsStoryCount, dbUsageStoryCount, recentStories);
                const finalCharCount = Math.max(lsCharCount, dbUsageCharCount, recentChars);
                
                const newLimits: Limits = {
                    createStory: { count: finalStoryCount, lastReset: today },
                    createCharacter: { count: finalCharCount, lastReset: today },
                };

                setLimits(newLimits);
                
                // Synchronize back to storage
                window.localStorage.setItem('apiRateLimits', JSON.stringify(newLimits));
                await Promise.all([
                    add<ApiUsage>('apiUsage', { id: 'createStory', ...newLimits.createStory }),
                    add<ApiUsage>('apiUsage', { id: 'createCharacter', ...newLimits.createCharacter }),
                ]);

            } catch (error) {
                console.error("Failed to synchronize API rate limits:", error);
                // In case of error, default to local storage or initial state
                setLimits(JSON.parse(window.localStorage.getItem('apiRateLimits') || JSON.stringify(initialLimitsState)));
            } finally {
                setIsLoading(false);
            }
        };

        synchronizeLimits();
    }, []);

    const recordAction = useCallback((action: ActionType) => {
        setLimits(prevLimits => {
            const today = getToday();
            const currentStatus = prevLimits[action];
            const newCount = (currentStatus?.lastReset === today ? currentStatus.count : 0) + 1;

            const newLimits = {
                ...prevLimits,
                [action]: { count: newCount, lastReset: today },
            };

            // Persist immediately to both local storage and IndexedDB
            window.localStorage.setItem('apiRateLimits', JSON.stringify(newLimits));
            add<ApiUsage>('apiUsage', { id: action, count: newCount, lastReset: today })
                .catch(err => console.error(`Failed to update apiUsage DB for ${action}`, err));
            
            return newLimits;
        });
    }, []);
    
    const getRemaining = useCallback((action: ActionType): number => {
        if (isLoading) return 0; // Don't allow actions while loading initial state
        const limit = DAILY_LIMITS[action];
        const used = limits[action]?.count ?? 0;
        return Math.max(0, limit - used);
    }, [limits, isLoading]);
    
    const isBlocked = useCallback((action: ActionType): boolean => {
        if (isLoading) return true;
        return getRemaining(action) <= 0;
    }, [getRemaining, isLoading]);

    return { getRemaining, recordAction, isBlocked, isLoading };
};