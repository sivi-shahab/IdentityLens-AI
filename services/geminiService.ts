import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Identity, AnalysisResult } from "../types";

// Helper to strip the data:image/xyz;base64, prefix
const cleanBase64 = (dataUrl: string): string => {
  const parts = dataUrl.split(',');
  return parts.length === 2 ? parts[1] : dataUrl;
};

const getMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  return match ? match[1] : 'image/jpeg';
}

export const analyzeFace = async (
  candidateImage: string,
  identities: Identity[]
): Promise<AnalysisResult> => {
  if (identities.length === 0) {
    return { matchedIdentityId: null, confidence: 0 };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct the prompt with parts
    const parts: any[] = [];
    
    // Add the candidate image first
    parts.push({
      inlineData: {
        mimeType: getMimeType(candidateImage),
        data: cleanBase64(candidateImage)
      }
    });
    parts.push({ text: "This is the CANDIDATE image." });

    // Add reference images for each identity
    // Note: In a production app, we might need to limit this to avoid token limits,
    // but for 2.5 Flash, we can handle a decent amount of context.
    identities.forEach((identity) => {
      parts.push({
        inlineData: {
          mimeType: getMimeType(identity.avatarUrl),
          data: cleanBase64(identity.avatarUrl)
        }
      });
      parts.push({ text: `Reference ID: ${identity.id}` });
    });

    const promptText = `
      You are a precise Face Recognition system.
      1. Analyze the face in the CANDIDATE image.
      2. Compare it strictly against the Reference images provided.
      3. If the candidate matches a reference person, return the Reference ID.
      4. If the candidate does not match any reference, return null.
      5. Provide a confidence score between 0 and 1.
    `;

    parts.push({ text: promptText });

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        matchedId: {
          type: Type.STRING,
          nullable: true,
          description: "The Reference ID of the matching person, or null if no match found.",
        },
        confidence: {
          type: Type.NUMBER,
          description: "Confidence score between 0.0 and 1.0",
        },
      },
      required: ["matchedId", "confidence"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for factual comparison
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");

    const parsed = JSON.parse(resultText);

    return {
      matchedIdentityId: parsed.matchedId,
      confidence: parsed.confidence || 0,
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback to unknown on error
    return { matchedIdentityId: null, confidence: 0 };
  }
};