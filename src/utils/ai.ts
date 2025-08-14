import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize Google Generative AI client with API key from environment
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

// Helper function to generate content using Gemini AI model
export const generateContent = (contents: string) => {
  return ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents
  });
};

