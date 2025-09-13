import type { SavedStory, StoryLayout } from '../types';

interface ShareablePart {
  paragraph: string;
  imagePrompt: string;
}

// This is the data structure that gets encoded/decoded.
// It contains image prompts instead of the full image data.
export type DecodedStory = Omit<SavedStory, 'id' | 'createdAt' | 'parts'> & {
  parts: ShareablePart[];
  layout?: StoryLayout; // Layout is optional for backwards compatibility
};

/**
 * Encodes a story object into a shareable Base64 string.
 * This version encodes the text and image PROMPTS, not the image data, to keep the code short.
 * @param story The story to encode.
 * @returns A Base64 encoded string.
 */
export const encodeStory = (story: SavedStory): string => {
  const { id, createdAt, ...shareableData } = story;

  // The 'shareableData' already includes the layout property.
  // We just need to transform the parts.
  const storyForSharing = {
    ...shareableData,
    parts: shareableData.parts.map(part => {
      if (!part.imagePrompt) {
        console.error("Cannot share story part without an imagePrompt:", part);
        throw new Error("Cannot share story: a part is missing an image prompt. This may be an older story.");
      }
      return {
        paragraph: part.paragraph,
        imagePrompt: part.imagePrompt,
      };
    }),
  };

  const jsonString = JSON.stringify(storyForSharing);
  // This robustly handles UTF-8 characters before encoding to Base64, avoiding errors with `btoa`.
  const utf8Encoded = encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
    (match, p1) => String.fromCharCode(parseInt(p1, 16))
  );
  return btoa(utf8Encoded);
};

/**
 * Decodes a shareable string back into a story object.
 * @param code The Base64 encoded story string.
 * @returns A story object ready to be imported.
 * @throws An error if the code is invalid or cannot be parsed.
 */
export const decodeStory = (code: string): DecodedStory => {
  try {
    // This robustly decodes from Base64 and handles UTF-8 characters correctly.
    const binaryString = atob(code);
    const jsonString = decodeURIComponent(
        Array.prototype.map.call(binaryString, (c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
    );

    const data = JSON.parse(jsonString);
    // Basic validation to ensure it looks like a story
    if (data.title && data.parts && data.prompt && Array.isArray(data.parts) && (data.parts.length === 0 || (data.parts[0].paragraph && data.parts[0].imagePrompt))) {
      return data as DecodedStory;
    } else {
      throw new Error('Invalid story data structure in code.');
    }
  } catch (error) {
    console.error("Failed to decode story:", error);
    throw new Error('The provided story code is invalid or corrupted. Please check and try again.');
  }
};