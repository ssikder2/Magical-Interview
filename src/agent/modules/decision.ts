import { generateContent } from "../../_internal/setup";
import { Action, FormData, PageState } from "../types";

export class DecisionModule {
  constructor(private formData: FormData) {}

  async decide(currentState: PageState, completedSections: Set<string>, completedFields: Set<string>): Promise<Action> {
    const prompt = `
      CRITICAL: Return ONLY raw JSON, no formatting, no markdown, no code blocks.
      The response must start with { and end with }.

      You are an AI agent filling out a web form. Follow this STRICT logic:
      
      Current state: ${JSON.stringify(currentState)}
      Available form data: ${JSON.stringify(this.formData)}
      Completed sections: ${JSON.stringify(Array.from(completedSections))}
      Completed fields: ${JSON.stringify(Array.from(completedFields))}
      
      STRICT RULES:
      1. Look at visible fields - if any can be filled, use BATCH_ACTIONS to fill them
      2. If no visible fields to fill, find the FIRST uncompleted section and use OPEN_SECTION
      3. NEVER go to a section that's already in completedSections - this is CRITICAL
      4. If all sections are completed, use SUBMIT
      5. If formCompleted is true, use COMPLETE
      6. Choose the next section dynamically from available sections, avoiding completed ones
      
      Return: {
        "type": "BATCH_ACTIONS|OPEN_SECTION|SUBMIT|COMPLETE",
        "actions": [
          {"action": "fill", "target": "fieldName", "value": "fieldValue"}
        ],
        "target": "section_name_if_opening_section",
        "reason": "why this batch"
      }
    `;

    try {
      const response = await generateContent(prompt);
      const responseText = response.text || '';
    
      const start = responseText.indexOf('{');
      const end = responseText.lastIndexOf('}') + 1;
      const jsonText = responseText.substring(start, end);
      
      const action = JSON.parse(jsonText);
      return action;
    } catch (error) {
      if ((error as any).status === 429) {
        console.log("Rate limited, waiting 15 seconds...");
        await new Promise(resolve => setTimeout(resolve, 15000));
        return this.decide(currentState, completedSections, completedFields);
      }
      console.error("AI decision failed:", error);
      return {
        type: 'RECOVER',
        target: 'retry_analysis',
        reason: 'AI parsing failed, retrying analysis'
      };
    }
  }
}
