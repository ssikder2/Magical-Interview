import { generateText } from "ai";
import { model } from "./_internal/setup";
import { createSession } from "./session";

export async function main() {
  // This will automatically create a chromium instance, connect, and navigate to the given url.
  // You are given a playwright page back.
  const page = await createSession("https://www.google.com");

  // We've given you an model (gemini-2.5-flash-preview-04-17), you can use the vercel AI SDK to generate text, setup tools, etc.
  // Ensure you have set the GOOGLE_GENERATIVE_AI_API_KEY environment variable.
  const response = await generateText({
    model,
    prompt: "How many r's are in strawberry?",
  });
}
