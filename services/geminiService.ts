import { GoogleGenAI, Type } from "@google/genai";
import { SpellAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSpell = async (handState: string, duration: number): Promise<SpellAnalysis> => {
  try {
    const prompt = `
      You are a magical AI interface from a cyberpunk future. 
      A user is casting a spell with the following hand configuration: "${handState}". 
      They have been holding this spell for ${duration.toFixed(1)} seconds.
      
      Generate a creative, mystical, yet sci-fi sounding name and description for this spell.
      The energy level should be based on duration (longer = higher).
      Return a valid JSON object.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the spell (e.g., 'Aegis of the Digital Void')" },
            type: { type: Type.STRING, description: "Type of magic (e.g., 'Defensive', 'Offensive', 'Illusion')" },
            description: { type: Type.STRING, description: "Short lore description." },
            energyLevel: { type: Type.STRING, description: "Power level reading (e.g., '8,900 kWh')" },
            colorHex: { type: Type.STRING, description: "Hex color code matching the spell vibe." }
          },
          required: ["name", "type", "description", "energyLevel", "colorHex"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SpellAnalysis;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      name: "Flux Interruption",
      type: "Error",
      description: "Unable to analyze magical signature due to network interference.",
      energyLevel: "0",
      colorHex: "#FF0000"
    };
  }
};
