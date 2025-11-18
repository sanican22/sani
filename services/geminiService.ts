
import { GoogleGenAI, Modality } from "@google/genai";

// Initialize the client with the API key from the environment
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

/**
 * Text & Vision Generation
 */
export const generateResponse = async (
  prompt: string,
  imageBase64?: string,
  model: string = 'gemini-3-pro-preview'
): Promise<string> => {
  try {
    let contents: any;

    if (imageBase64) {
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: imageBase64.split(',')[1] || imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      };
    } else {
      contents = prompt;
    }

    // specific config for "Pro" or "5.1" simulated feel
    const isHighReasoning = model.includes('pro');
    
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        // If it's a pro model request, we can optionally enable thinking or high tokens
        // thinkingConfig: isHighReasoning ? { thinkingBudget: 2048 } : undefined,
      }
    });

    if (response.text) {
      return response.text;
    }
    return "Yanıt oluşturulamadı.";
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    return `Bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`;
  }
};

/**
 * Image Generation using Imagen
 */
export const generateImage = async (prompt: string, aspectRatio: string = '1:1'): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio as any,
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Görsel verisi alınamadı.");
  } catch (error: any) {
    console.error("Imagen Service Error:", error);
    throw error;
  }
};

/**
 * Video Generation using Veo (Supports Infinite Extension)
 */
export const generateVideo = async (
  prompt: string, 
  previousVideoAsset?: any
): Promise<{ url: string, asset: any }> => {
  try {
    let operation;

    if (previousVideoAsset) {
      // EXTEND MODE
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview', // Must use generate-preview for extend
        prompt: prompt, // Mandatory for extend
        video: previousVideoAsset, // Pass previous video asset
        config: {
          numberOfVideos: 1,
          resolution: '720p', // Only 720p can be extended
          aspectRatio: '16:9', // Must match previous
        }
      });
    } else {
      // NEW VIDEO MODE
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p', // Defaulting to 720p to allow future extension
          aspectRatio: '16:9'
        }
      });
    }

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoResult = operation.response?.generatedVideos?.[0]?.video;
    const downloadLink = videoResult?.uri;
    
    if (!downloadLink) {
      throw new Error("Video URI bulunamadı.");
    }

    // Fetch the actual video bytes using the API key
    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!videoResponse.ok) throw new Error("Video indirilemedi.");
    
    const videoBlob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(videoBlob);

    return {
      url: videoUrl,
      asset: videoResult // Return the asset so we can extend it later
    };

  } catch (error: any) {
    console.error("Veo Service Error:", error);
    throw error;
  }
};

/**
 * Text to Speech using Gemini 2.5 Flash TTS
 */
export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<ArrayBuffer> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("Ses verisi üretilemedi.");
    }

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;

  } catch (error: any) {
    console.error("TTS Service Error:", error);
    throw error;
  }
};
