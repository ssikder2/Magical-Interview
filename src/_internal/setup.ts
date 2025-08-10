import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

export const generateContent = (contents: string) => {
  return ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents
  });
};

