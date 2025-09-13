// FIX: Import Jest globals to resolve test runner function errors like "Cannot find name 'describe'".
import { describe, it, expect } from '@jest/globals';
// FIX: Import DecodedStory from its source file './storyShare' where it is defined, instead of from '../types'.
import { encodeStory, decodeStory, type DecodedStory } from './storyShare';
import type { SavedStory } from '../types';

describe('storyShare utilities', () => {
  // A mock story object that conforms to the SavedStory type
  const mockStory: SavedStory = {
    id: 'story-12345',
    createdAt: new Date().toISOString(),
    title: 'The Brave Little Firefly',
    layout: 'classic',
    prompt: {
      character: 'A brave little firefly named Flicker',
      setting: 'A magical, moonlit forest',
      plot: 'Who is trying to find the lost North Star to guide it home',
      concept: 'The importance of perseverance',
    },
    parts: [
      {
        paragraph: 'Once upon a time, in a moonlit forest, lived a firefly named Flicker.',
        imagePrompt: 'A tiny firefly named Flicker glowing in a magical forest at night.',
        imageUrl: 'data:image/png;base64,mock-image-data-1',
      },
      {
        paragraph: 'Flicker was on a mission to find the lost North Star.',
        imagePrompt: 'Flicker the firefly looking up at a starry sky, searching for the North Star.',
        imageUrl: 'data:image/png;base64,mock-image-data-2',
      },
    ],
  };

  it('should correctly encode and decode a story object', () => {
    // Encode the story
    const encodedCode = encodeStory(mockStory);
    
    // Assert that the encoded string is a valid base64 string
    expect(typeof encodedCode).toBe('string');
    expect(encodedCode.length).toBeGreaterThan(0);

    // Decode the story
    const decodedStory = decodeStory(encodedCode);

    // Create the expected decoded object (without id, createdAt, and imageUrls)
    const expectedDecodedStory: DecodedStory = {
      title: mockStory.title,
      layout: mockStory.layout,
      prompt: mockStory.prompt,
      parts: mockStory.parts.map(part => ({
        paragraph: part.paragraph,
        imagePrompt: part.imagePrompt,
      })),
    };

    // Assert that the decoded story matches the original data (excluding fields not in DecodedStory)
    expect(decodedStory).toEqual(expectedDecodedStory);
  });

  it('should throw an error for invalid or corrupted code', () => {
    const invalidCode = 'this-is-not-a-valid-base64-code';
    
    // We expect the decodeStory function to throw an error when given invalid input
    expect(() => decodeStory(invalidCode)).toThrow(
      'The provided story code is invalid or corrupted. Please check and try again.'
    );
  });

  it('should handle special UTF-8 characters in text fields', () => {
      const storyWithSpecialChars: SavedStory = {
          ...mockStory,
          title: "The Tale of the Éléphant & the Fox’s ✨",
          parts: [{
              ...mockStory.parts[0],
              paragraph: 'A story with emojis 😊 and accents like résumé.'
          }]
      };

      const encoded = encodeStory(storyWithSpecialChars);
      const decoded = decodeStory(encoded);

      expect(decoded.title).toBe(storyWithSpecialChars.title);
      expect(decoded.parts[0].paragraph).toBe(storyWithSpecialChars.parts[0].paragraph);
  });

  it('should throw an error if a story part is missing an imagePrompt during encoding', () => {
     const storyWithoutPrompt: SavedStory = {
        ...mockStory,
        parts: [
            {
                paragraph: 'This part is fine.',
                imagePrompt: 'A good prompt.',
                imageUrl: 'data:image/png;base64,good-image'
            },
            {
                paragraph: 'This part is missing a prompt.',
                // @ts-ignore - Intentionally create an invalid object for testing
                imagePrompt: undefined, 
                imageUrl: 'data:image/png;base64,bad-image'
            }
        ]
     };

     expect(() => encodeStory(storyWithoutPrompt)).toThrow(
        'Cannot share story: a part is missing an image prompt. This may be an older story.'
     );
  });
});