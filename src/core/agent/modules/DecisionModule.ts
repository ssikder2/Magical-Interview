import { Action, FormData, PageState } from "../../../types";
import { generateContent } from "../../../utils/ai";

/**
 * DecisionModule handles the AI-powered decision making for form filling strategy.
 * It determines whether to fill fields, open sections, or submit the form based on
 * the current state and available data.
 */
export class DecisionModule {
  constructor(private formData: FormData) {}

  // AI-powered decision making for form filling strategy
  async decide(currentState: PageState, completedSections: Set<string>, completedFields: Set<string>): Promise<Action> {
    // Check if form has already been submitted to avoid unnecessary processing
    if (currentState.formCompleted) {
      return {
        type: 'COMPLETE',
        reason: 'Form has already been submitted successfully'
      };
    }

    // Fill any visible fields that have available data and haven't been completed yet
    if (currentState.visibleFields.length > 0) {
      const fieldsToFill = currentState.visibleFields.filter(field => 
        !completedFields.has(field.name) && 
        this.formData[field.name] !== undefined
      );

      if (fieldsToFill.length > 0) {
        return {
          type: 'BATCH_ACTIONS',
          actions: fieldsToFill.map(field => ({
            action: 'fill',
            target: field.name,
            value: this.formData[field.name] || ''
          })),
          reason: `Filling ${fieldsToFill.length} visible fields: ${fieldsToFill.map(f => f.name).join(', ')}`
        };
      }
    }

    const prompt = `
      Return ONLY raw JSON: {"type": "OPEN_SECTION|SUBMIT", "target": "section_name", "reason": "why"}

      You are an AI agent filling out a web form. Analyze the current state and decide the next action.

      CURRENT STATE:
      - Visible fields: ${currentState.visibleFields.map(f => f.name).join(', ')}
      - Completed fields: ${Array.from(completedFields).join(', ')}
      - Available form data: ${Object.keys(this.formData).join(', ')}

      FORM STRUCTURE:
      - Sections: ${currentState.sections.length > 0 ? currentState.sections.map(s => `${s.name} (${s.isOpen ? 'open' : 'closed'})`).join(', ') : 'Single page form - no sections'}
      - Completed sections: ${currentState.sections.length > 0 ? Array.from(completedSections).join(', ') : 'N/A'}
      - Form completion status: ${currentState.formCompleted}

      DECISION LOGIC:
      IF THIS IS A SINGLE PAGE FORM (no sections):
      - If all visible fields are completed → SUBMIT
      - If some fields are unfilled → Wait for more fields to become visible

      IF THIS IS A SECTIONED FORM (has sections):
      - A section is COMPLETE when ALL its fields with available data are in completedFields
      - NEVER reopen a section that is in completedSections
      - Only open sections that are NOT in completedSections
      - If all sections are completed → SUBMIT

      CRITICAL RULES:
      1. Check form type first (single page vs sectioned)
      2. For single page forms: submit when all fields done
      3. For sectioned forms: never reopen completed sections
      4. Submit when form is truly complete

      What should I do next?
      - OPEN_SECTION: ONLY for sectioned forms with unfilled sections NOT in completedSections
      - SUBMIT: if all fields/sections are completed
    `;

    try {
      // Get AI decision and parse the JSON response
      const response = await generateContent(prompt);
      const responseText = response.text || '';
      
      const start = responseText.indexOf('{');
      const end = responseText.lastIndexOf('}') + 1;
      const jsonText = responseText.substring(start, end);
      
      const action = JSON.parse(jsonText);
      return action;
    } catch (error) {
      // Handle rate limiting with exponential backoff
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
