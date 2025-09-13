import { GoogleGenAI, Type } from "@google/genai";
import type { UserPrompt, StoryApiResponse, StoryPart } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to add a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const storySchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A creative and catchy title for the story, under 10 words."
        },
        story: {
            type: Type.ARRAY,
            description: "An array of exactly 3 story parts.",
            items: {
                type: Type.OBJECT,
                properties: {
                    paragraph: {
                        type: Type.STRING,
                        description: "A paragraph of the story, about 50-100 words long. It should be engaging and suitable for a child's bedtime story."
                    },
                    imagePrompt: {
                        type: Type.STRING,
                        description: "A detailed, descriptive prompt for an image generation model to create an illustration for this paragraph. Describe the scene, characters, and actions in a visually rich way. Style: 'whimsical, dreamy, digital art, children's book illustration'."
                    }
                },
                required: ["paragraph", "imagePrompt"]
            }
        }
    },
    required: ["title", "story"]
};

const storyIdeasSchema = {
    type: Type.OBJECT,
    properties: {
        character: { type: Type.STRING, description: 'A brief description of a whimsical main character for a bedtime story. e.g., "A curious gnome with a lantern that glows with captured moonlight"' },
        setting: { type: Type.STRING, description: 'A magical and imaginative setting for the story. e.g., "An ancient library where books whisper secrets to each other"' },
        plot: { type: Type.STRING, description: 'A simple, engaging plot for the story. e.g., "Is searching for a lost lullaby that can put the grumpy moon to sleep"' },
        concept: { type: Type.STRING, description: 'A positive moral or concept the story should convey. e.g., "The magic of listening to others"' }
    },
    required: ["character", "setting", "plot", "concept"]
};

export const generateStoryIdeas = async (): Promise<UserPrompt> => {
    const prompt = `Generate a creative and whimsical bedtime story idea for a child.
    Provide a main character, a setting, a plot, and a moral or concept.
    The ideas should be unique, imaginative, and spark creativity.
    Return the response as a JSON object with keys: 'character', 'setting', 'plot', 'concept'.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: storyIdeasSchema,
        }
    });

    const ideas: UserPrompt = JSON.parse(response.text);
    return ideas;
};


export const generateStoryAndImages = async (
    prompt: UserPrompt,
    setLoadingMessage: (message: string) => void
): Promise<{ title: string; parts: StoryPart[] }> => {
    
    setLoadingMessage('Crafting a wondrous tale just for you...');

    const storyPrompt = `Create a short bedtime story for a child.
    - Main Character: ${prompt.character}
    - Setting: ${prompt.setting}
    - Plot: ${prompt.plot}
    - Moral/Concept to convey: ${prompt.concept}
    The story should be gentle, magical, and have a happy or peaceful ending. It must subtly teach the moral or concept provided. Break it into exactly 3 paragraphs. For each paragraph, create a detailed image prompt.`;

    let textResponse;
    try {
        textResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: storyPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: storySchema,
            }
        });
    } catch (error) {
        console.error("Error generating story text:", error);
        if (error instanceof Error && (error.message.toLowerCase().includes('quota') || error.message.toLowerCase().includes('rate limit'))) {
            throw new Error(`The AI storyteller is resting! We've exceeded our story generation quota. Please wait a moment and try again.`);
        }
        throw new Error("There was a problem dreaming up the story. The AI may be busy. Please try again.");
    }

    let storyData: StoryApiResponse;
    try {
        storyData = JSON.parse(textResponse.text);
    } catch (e) {
        console.error("Failed to parse story data from AI response:", textResponse.text, e);
        throw new Error("The AI's response was not in the expected format. Please try generating the story again.");
    }


    if (!storyData.story || storyData.story.length === 0) {
        throw new Error("The AI failed to generate a valid story structure. Please try again with a different prompt.");
    }

    const finalStoryParts: StoryPart[] = [];

    for (const [index, part] of storyData.story.entries()) {
        setLoadingMessage(`Generating illustration ${index + 1} of ${storyData.story.length}...`);

        // Add a delay between image generation calls to avoid hitting rate limits.
        if (index > 0) {
            await delay(3000); // Increased delay to 3 seconds
        }

        try {
            const imageResult = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: part.imagePrompt,
                config: {
                    numberOfImages: 1,
                    aspectRatio: '1:1',
                    outputMimeType: 'image/png'
                }
            });

            if (!imageResult.generatedImages || imageResult.generatedImages.length === 0) {
                throw new Error(`Failed to generate image for paragraph ${index + 1}.`);
            }
            
            const base64ImageBytes = imageResult.generatedImages[0].image.imageBytes;
            
            finalStoryParts.push({
                paragraph: part.paragraph,
                imageUrl: `data:image/png;base64,${base64ImageBytes}`,
                imagePrompt: part.imagePrompt
            });
        } catch (error) {
            console.error(`Error generating image for part ${index + 1}:`, error);
            if (error instanceof Error && (error.message.toLowerCase().includes('quota') || error.message.toLowerCase().includes('rate limit'))) {
                 throw new Error(`The story-making magic is in high demand! We couldn't create illustration ${index + 1}. Please wait a moment and try again.`);
            }
            if (error instanceof Error && error.message.toLowerCase().includes('safety')) {
                throw new Error(`Illustration ${index + 1} couldn't be created due to safety filters. Please try adjusting the prompt.`);
           }
            throw new Error(`There was a problem creating illustration ${index + 1}. The AI may be busy. Please try again.`);
        }
    }

    return { title: storyData.title, parts: finalStoryParts };
};

export const generateStoryIllustration = async (prompt: string): Promise<string> => {
    try {
        const imageResult = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: '1:1',
                outputMimeType: 'image/png'
            }
        });

        if (!imageResult.generatedImages || imageResult.generatedImages.length === 0) {
            throw new Error(`Failed to generate image.`);
        }
        
        const base64ImageBytes = imageResult.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error(`Error generating illustration:`, error);
        if (error instanceof Error && (error.message.toLowerCase().includes('quota') || error.message.toLowerCase().includes('rate limit'))) {
             throw new Error(`The story-making magic is in high demand! We couldn't create an illustration. Please wait a moment and try again.`);
        }
        if (error instanceof Error && error.message.toLowerCase().includes('safety')) {
            throw new Error(`The illustration couldn't be created due to safety filters.`);
       }
        throw new Error(`There was a problem creating the illustration. The AI may be busy. Please try again.`);
    }
};

export const generateCharacterImage = async (description: string): Promise<string> => {
    try {
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Portrait of a storybook character: ${description}. Style: whimsical, friendly, children's book illustration, detailed, vibrant colors, close-up on face.`,
            config: {
                numberOfImages: 1,
                aspectRatio: '1:1',
                outputMimeType: 'image/png'
            }
        });

        if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
            throw new Error('Failed to generate character image.');
        }

        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        if (error instanceof Error && (error.message.toLowerCase().includes('quota') || error.message.toLowerCase().includes('rate limit'))) {
            throw new Error('The character portrait studio is very busy right now. Please wait a moment and try again.');
        }
        throw error;
    }
}