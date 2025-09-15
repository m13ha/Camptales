import { Type } from "@google/genai";
import type { UserPrompt, StoryPart, AspectRatio } from '../types';
import { ai, handleApiError } from './apiClient';

// Helper function to add a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to parse a data: URL into its components
const parseDataUrl = (dataUrl: string): { mimeType: string; data: string; } => {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        throw new Error('Invalid data URL format');
    }
    return {
        mimeType: match[1],
        data: match[2]
    };
};

const storyPartsSchema = {
    type: Type.OBJECT,
    properties: {
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
    required: ["story"]
};

export const generateTitle = async (prompt: UserPrompt): Promise<string> => {
    try {
        const titlePrompt = `Generate a creative and catchy title, under 10 words, for a children's bedtime story with the following elements:
- Character: ${prompt.character}
- Setting: ${prompt.setting}
- Plot: ${prompt.plot}
- Concept: ${prompt.concept}
Return only the title text, without any labels or quotes.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: titlePrompt,
        });

        return response.text.trim().replace(/"/g, '');
    } catch (error) {
        throw handleApiError(error, "generate a title for the story");
    }
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

export const generateStoryIdeas = async (category: string = 'Surprise Me!'): Promise<UserPrompt> => {
    try {
        let generationPrompt: string;
        if (category === 'Surprise Me!' || !category) {
            generationPrompt = `Generate a creative and whimsical bedtime story idea for a child. The ideas should be unique, imaginative, and spark creativity.`;
        } else {
            generationPrompt = `Generate a creative and whimsical bedtime story idea for a child focused on the theme of "${category}". Explain the core concept in a simple, age-appropriate way through the story's plot and moral. The ideas should be unique and imaginative.`;
        }
        
        const fullPrompt = `${generationPrompt}\n\nReturn the response as a JSON object with keys: 'character', 'setting', 'plot', 'concept'. The 'concept' should directly relate to the chosen theme.`;


        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: storyIdeasSchema,
            }
        });

        const ideas: UserPrompt = JSON.parse(response.text);
        return ideas;
    } catch (error) {
        if (error instanceof SyntaxError) {
             throw new Error("The AI's response for new ideas was not in the expected format. Please try again.");
        }
        throw handleApiError(error, "brainstorm new story ideas");
    }
};


export const generateStoryAndImages = async (
    prompt: UserPrompt,
    setLoadingMessage: (message: string) => void,
    aspectRatio: AspectRatio,
    characterImageUrl?: string | null
): Promise<StoryPart[]> => {
    
    const storyPrompt = `Create a short bedtime story for a child.
    - Main Character: ${prompt.character}
    - Setting: ${prompt.setting}
    - Plot: ${prompt.plot}
    - Moral/Concept to convey: ${prompt.concept}
    The story should be gentle, magical, and have a happy or peaceful ending. It must subtly teach the moral or concept provided. Break it into exactly 3 paragraphs. For each paragraph, create a detailed image prompt.`;

    let contents: any;

    if (characterImageUrl) {
        try {
            setLoadingMessage('Analyzing character portrait...');
            const { mimeType, data } = parseDataUrl(characterImageUrl);
            const imagePart = {
                inlineData: { mimeType, data }
            };
            const textPart = {
                text: `${storyPrompt}\n\nIMPORTANT: The provided image is the main character. Ensure the generated image prompts describe a character consistent with this image.`
            };
            contents = { parts: [imagePart, textPart] };
        } catch (error) {
            console.error("Failed to process character image, falling back to text-only:", error);
            contents = storyPrompt;
        }
    } else {
        contents = storyPrompt;
    }


    let textResponse;
    try {
        setLoadingMessage('Crafting a wondrous tale just for you...');
        textResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: 'application/json',
                responseSchema: storyPartsSchema,
            }
        });
    } catch (error) {
        throw handleApiError(error, "dream up the story text");
    }
    
    let storyData: { story: { paragraph: string, imagePrompt: string }[] };
    try {
        const sanitizedText = textResponse.text.trim().replace(/^```json\s*/, '').replace(/```$/, '');
        storyData = JSON.parse(sanitizedText);
    } catch (e) {
        console.error("Failed to parse story data from AI response. Raw text was:", textResponse.text, "Error:", e);
        throw new Error("The AI's story response was not in the expected format. Please try generating the story again.");
    }
    
    if (!storyData.story || !Array.isArray(storyData.story) || storyData.story.length === 0) {
        console.error("Parsed story data is missing a valid 'story' array:", storyData);
        throw new Error("The AI failed to generate a valid story structure. Please try again with a different prompt.");
    }

    const finalStoryParts: StoryPart[] = [];

    for (const [index, part] of storyData.story.entries()) {
        setLoadingMessage(`Generating illustration ${index + 1} of ${storyData.story.length}...`);
        await delay(5000);

        try {
            const imageResult = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: part.imagePrompt,
                config: {
                    numberOfImages: 1,
                    aspectRatio: aspectRatio,
                    outputMimeType: 'image/png'
                }
            });

            if (!imageResult.generatedImages || imageResult.generatedImages.length === 0) {
                throw new Error(`The AI did not return an image for illustration ${index + 1}.`);
            }
            
            const base64ImageBytes = imageResult.generatedImages[0].image.imageBytes;
            
            finalStoryParts.push({
                paragraph: part.paragraph,
                imageUrl: `data:image/png;base64,${base64ImageBytes}`,
                imagePrompt: part.imagePrompt
            });
        } catch (error) {
            throw handleApiError(error, `create illustration ${index + 1}`);
        }
    }

    return finalStoryParts;
};

export const generateStoryIllustration = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    try {
        const imageResult = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: aspectRatio,
                outputMimeType: 'image/png'
            }
        });

        if (!imageResult.generatedImages || imageResult.generatedImages.length === 0) {
            throw new Error(`The AI did not return an image.`);
        }
        
        const base64ImageBytes = imageResult.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        throw handleApiError(error, "create the illustration");
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
            throw new Error('The AI did not return a character image.');
        }

        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        throw handleApiError(error, "generate the character portrait");
    }
}

// Helper function to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const characterSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'A creative name for the character based on the description. e.g., "Sparklewing"' },
        description: { type: Type.STRING, description: 'A detailed description of the character, captured from the audio. e.g., "A tiny dragon the size of a teacup with shimmering, rainbow-colored scales."' },
    },
    required: ["name", "description"]
};

export const transcribeAndStructureCharacterPrompt = async (audioBlob: Blob): Promise<{ name: string; description: string; }> => {
    try {
        const base64Audio = await blobToBase64(audioBlob);

        const instructionPrompt = `
            Transcribe the following audio, which describes a story character.
            Based on the transcription, extract the following components:
            1.  **Name**: The character's name. If a name isn't explicitly mentioned, invent a creative one that fits the description.
            2.  **Description**: A detailed physical and personality description of the character.

            Return the response as a single, well-formed JSON object with keys: "name" and "description".
        `;

        const audioPart = {
            inlineData: {
                mimeType: audioBlob.type,
                data: base64Audio
            }
        };

        const textPart = {
            text: instructionPrompt
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: characterSchema,
            }
        });

        const characterData: { name: string; description: string; } = JSON.parse(response.text);
        return characterData;

    } catch (error) {
        if (error instanceof SyntaxError) {
             throw new Error("The AI's response to your audio was not in the expected format. Please try speaking again.");
        }
        throw handleApiError(error, "understand your character idea from the audio");
    }
}

export const transcribeAndStructureStoryPrompt = async (audioBlob: Blob): Promise<UserPrompt> => {
    try {
        const base64Audio = await blobToBase64(audioBlob);

        const instructionPrompt = `
            Transcribe the following audio, which describes a bedtime story idea.
            Based on the transcription, extract the following components:
            1.  **Main Character**: A description of the protagonist.
            2.  **Setting**: Where the story takes place.
            3.  **Plot**: The main events or goal of the story.
            4.  **Concept**: The underlying moral, theme, or lesson.

            Return the response as a single, well-formed JSON object with keys: "character", "setting", "plot", and "concept".
            If any component is not explicitly mentioned, infer a creative and suitable value based on the context provided.
        `;

        const audioPart = {
            inlineData: {
                mimeType: audioBlob.type,
                data: base64Audio
            }
        };

        const textPart = {
            text: instructionPrompt
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: storyIdeasSchema,
            }
        });

        const structuredPrompt: UserPrompt = JSON.parse(response.text);
        return structuredPrompt;

    } catch (error) {
        if (error instanceof SyntaxError) {
             throw new Error("The AI's response to your audio was not in the expected format. Please try speaking again.");
        }
        throw handleApiError(error, "understand your story idea from the audio");
    }
}
