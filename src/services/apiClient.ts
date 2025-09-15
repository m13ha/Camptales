import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const handleApiError = (error: unknown, context: string): Error => {
    console.error(`Error in ${context}:`, error);
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('quota') || message.includes('rate limit') || message.includes('429')) {
            return new Error(`The AI storyteller is resting! We've exceeded our generation quota. Please wait a moment and try again.`);
        }
        if (message.includes('safety')) {
            return new Error(`The AI couldn't proceed due to safety filters. Please try adjusting your prompt.`);
        }
        return new Error(`Failed to ${context}. The AI might be busy or there was a network issue. Please try again.`);
    }
    return new Error(`An unknown error occurred while trying to ${context}.`);
};
