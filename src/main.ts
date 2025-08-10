import { MedicalFormAgent } from "./agent/medicalFormAgent";
import { createSession } from "./session";

export async function main() {
  console.log("Starting Medical Form Agent...");
  
  const page = await createSession("https://magical-medical-form.netlify.app/");

  const agent = new MedicalFormAgent(page);
  
  console.log("Browser ready! Press Enter in terminal to run the agent...");

  process.stdin.once('data', async () => {
    try {
      await agent.run();
    } catch (error) {
      console.error("Agent Failed:", error);
    }
  });
  
  await new Promise(() => {});
}

