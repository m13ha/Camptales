import { ai, handleApiError } from './apiClient';

// Based on user-provided example for WAV conversion
const createWavHeader = (dataLength: number, numChannels: number, sampleRate: number, bitsPerSample: number): ArrayBuffer => {
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    // RIFF identifier
    view.setUint8(0, 82); // 'R'
    view.setUint8(1, 73); // 'I'
    view.setUint8(2, 70); // 'F'
    view.setUint8(3, 70); // 'F'
    // file length
    view.setUint32(4, 36 + dataLength, true);
    // WAVE identifier
    view.setUint8(8, 87); // 'W'
    view.setUint8(9, 65); // 'A'
    view.setUint8(10, 86); // 'V'
    view.setUint8(11, 69); // 'E'
    // fmt sub-chunk identifier
    view.setUint8(12, 102); // 'f'
    view.setUint8(13, 109); // 'm'
    view.setUint8(14, 116); // 't'
    view.setUint8(15, 32); // ' '
    // sub-chunk size
    view.setUint32(16, 16, true);
    // audio format (1 = PCM)
    view.setUint16(20, 1, true);
    // number of channels
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate
    view.setUint32(28, byteRate, true);
    // block align
    view.setUint16(32, blockAlign, true);
    // bits per sample
    view.setUint16(34, bitsPerSample, true);
    // data sub-chunk identifier
    view.setUint8(36, 100); // 'd'
    view.setUint8(37, 97); // 'a'
    view.setUint8(38, 116); // 't'
    view.setUint8(39, 97); // 'a'
    // data sub-chunk size
    view.setUint32(40, dataLength, true);

    return buffer;
};

// Helper to convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

export const generateSpeech = async (text: string, voiceName: string): Promise<Blob> => {
    console.log(`[TTS] Requesting speech for text: "${text.substring(0, 50)}..." with voice: ${voiceName}`);
    try {
        console.log('[TTS] Preparing API request...');
        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: text }]
                }
            ],
            config: {
                temperature: 1,
                responseModalities: ['audio'],
                // FIX: Corrected snake_case properties to camelCase to match the Gemini API type definitions.
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: voiceName
                        }
                    }
                },
            },
        });
        console.log('[TTS] API request sent. Awaiting stream...');

        let audioData = '';
        let mimeType = 'audio/L16;rate=24000'; // Default, but should be updated by response
        let chunkCount = 0;

        for await (const chunk of response) {
            chunkCount++;
            if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
                const inlineData = chunk.candidates[0].content.parts[0].inlineData;
                if (inlineData.data) {
                    audioData += inlineData.data;
                }
                if (inlineData.mimeType && mimeType !== inlineData.mimeType) {
                    mimeType = inlineData.mimeType;
                    console.log(`[TTS] Received mimeType from API: ${mimeType}`);
                }
            }
        }
        console.log(`[TTS] Stream finished. Received ${chunkCount} chunks. Total audio data length: ${audioData.length}`);

        if (!audioData) {
            throw new Error("No audio data was returned from the API.");
        }

        // The API returns raw PCM data, which browsers can't play. We need to wrap it in a WAV header.
        const rateMatch = mimeType.match(/rate=(\d+)/);
        const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
        const bitsPerSample = 16;
        const numChannels = 1;
        console.log(`[TTS] Creating WAV with sample rate: ${sampleRate}`);

        const pcmData = base64ToArrayBuffer(audioData);
        const wavHeader = createWavHeader(pcmData.byteLength, numChannels, sampleRate, bitsPerSample);
        
        const wavBlob = new Blob([wavHeader, pcmData], { type: 'audio/wav' });
        console.log(`[TTS] Created WAV blob. Size: ${wavBlob.size} bytes`);
        
        return wavBlob;

    } catch (error) {
        console.error('[TTS] Raw Error:', JSON.stringify(error)); // Log the raw error as a string for better inspection
        throw handleApiError(error, "generate premium AI speech");
    }
};