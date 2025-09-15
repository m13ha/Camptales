import { GoogleGenAI } from "@google/genai";

// Get the API key from environment variables
const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;

if (!apiKey) {
    console.error("VITE_GOOGLE_GENAI_API_KEY environment variable is not set. Please check your .env file.");
    // Don't throw an error here to allow the app to load in development without an API key
    // The error will be shown to the user when they try to use a feature that requires the API
}

export const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const handleApiError = (error: unknown, context: string): Error => {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('api key') || message.includes('authentication')) {
            return new Error('Missing or invalid API key. Please check your configuration.');
        }
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
