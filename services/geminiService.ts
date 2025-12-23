
import { GoogleGenAI } from "@google/genai";

// Fix: Use process.env.API_KEY directly when initializing the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDemolitionAdvice = async (levelName: string, levelNum: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a demolition expert. Provide a one-sentence witty advice for destroying a structure called "${levelName}" (Level ${levelNum}). Keep it short and aggressive. Use Japanese.`,
    });
    return response.text || "すべてを破壊せよ。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "建物の土台を狙うのがコツだ。";
  }
};
