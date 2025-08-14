import { Action, FormData, PageState } from "../../../types";
import { generateContent } from "../../../utils/ai";

export class DecisionModule {
  constructor(private formData: FormData) {}

  async decide(currentState: PageState, completedSections: Set<string>, completedFields: Set<string>): Promise<Action> {
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
      CRITICAL: Return ONLY raw JSON, no formatting, no markdown, no code blocks.
      The response must start with { and end with }.

      You are an intelligent AI agent that can analyze ANY web form and create optimal filling strategies.
      
      CURRENT FORM ANALYSIS:
      - Form structure: ${JSON.stringify(currentState.sections)}
      - Visible fields: ${JSON.stringify(currentState.visibleFields)}
      - Completed sections: ${JSON.stringify(Array.from(completedSections))}
      - Completed fields: ${JSON.stringify(Array.from(completedFields))}
      - Form data available: ${JSON.stringify(this.formData)}
      - Form completion status: ${currentState.formCompleted}
      
      YOUR TASK: Analyze this form and decide the optimal next action.
      
      FORM STRUCTURE DETECTION:
      First, determine what type of form this is:
      - SINGLE PAGE: All fields visible at once (contact forms, simple surveys)
      - SECTIONS: Form with collapsible/expandable sections (medical forms, job apps)
      - TABS: Form with tabbed content areas
      - WIZARD: Multi-step form with Next/Previous navigation
      
      ADAPTIVE STRATEGY:
      Based on the form type, use the appropriate approach:
      
      SINGLE PAGE FORMS:
      - Fill all visible fields that have data
      - Submit when all fields are completed
      
      SECTION/TAB FORMS:
      - Fill all visible fields in current section
      - Open next section/tab with unfilled fields
      - Repeat until all sections are processed
      - Submit when all sections are complete
      
      WIZARD FORMS:
      - Fill all visible fields on current step
      - Navigate to next step if fields are complete
      - Submit on final step
      
      CRITICAL INSTRUCTIONS:
      1. You must FILL OUT all visible fields before moving to next section/step
      2. Having data in formData does NOT mean fields are filled - execute the fill actions
      3. Adapt your strategy based on the detected form structure
      4. Only submit when you have actually filled all required fields
      
      POSSIBLE ACTIONS:
      - OPEN_SECTION: Open a section/tab/step that contains unfilled fields
      - SUBMIT: Submit the form if all required fields are actually filled and visible
      - COMPLETE: Mark as complete if form is already submitted
      
      Return your intelligent decision as JSON:
      {
        "type": "OPEN_SECTION|SUBMIT|COMPLETE",
        "target": "section_name_if_opening_section",
        "reason": "Your intelligent analysis including: 1) What type of form this is, 2) Why this is the optimal next action, 3) Your strategy for this form type"
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
