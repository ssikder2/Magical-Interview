import { Page } from "playwright";
import { generateContent } from "../_internal/setup";

export class MedicalFormAgent {
  private page: Page;
  private formData: any;
  private completedSections: Set<string> = new Set();
  private completedFields: Set<string> = new Set();

  constructor(page: Page) {
    this.page = page;
    this.formData = {
      firstName: "John",
      lastName: "Doe", 
      dateOfBirth: "1990-01-01",
      medicalId: "91927885",
      gender: "Male",
      bloodType: "O+",
      allergies: "",
      currentMedications: "",
      emergencyContact: "Jane Doe",
      emergencyPhone: "555-123-4567"
    };
  }

  async run() {
    console.log("Agent starting...");

    while (true) {
      const currentState = await this.perceive()
      console.log("current state:", currentState);

      const action = await this.decide(currentState);
      console.log("Decided action:", action)

      await this.act(action);

      if (action.type === "COMPLETE") {
        console.log("Form Completed");
        break;
      }
    }
  }

  private async perceive(){
    const state = await this.page.evaluate(() => {
      const sections = document.querySelectorAll('form button');
      const visibleFields = document.querySelectorAll('input, select, textarea');

      const successIndicators = document.querySelectorAll('[class*="success"], [class*="complete"], [class*="done"], [id*="success"], [id*="complete"]');
      const hasSuccessMessage = successIndicators.length > 0 || document.body.textContent?.includes('success') || document.body.textContent?.includes('complete');

      return {
        sections: Array.from(sections).map(btn => ({
          name: btn.textContent?.trim(),
          isOpen: btn.getAttribute('aria-expanded') === 'true'
        })),
        visibleFields: Array.from(visibleFields).map(field => {
          if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
            return {  
              name: field.name,
              type: field.type || field.tagName.toLowerCase(),
              value: field.value,
              isVisible: field.offsetParent !== null
            };
          }
          return null;
        }).filter(Boolean),
        formCompleted: hasSuccessMessage
      };
    });
    return {
      ...state,
      completedSections: Array.from(this.completedSections),
      completedFields: Array.from(this.completedFields)
    };
  }

  private async decide(currentState: any): Promise<any> {
    const prompt = `
    CRITICAL: Return ONLY raw JSON, no formatting, no markdown, no code blocks.
    The response must start with { and end with }.

    You are an AI agent filling out a web form. Follow this simple logic:
    
    Current state: ${JSON.stringify(currentState)}
    Available form data: ${JSON.stringify(this.formData)}
    Completed sections: ${JSON.stringify(Array.from(this.completedSections))}
    Completed fields: ${JSON.stringify(Array.from(this.completedFields))}

    SIMPLE RULES:
    1. Look at visible fields - if any can be filled, use BATCH_ACTIONS to fill them
    2. If no visible fields to fill, open the next uncompleted section
    3. Never go to a section that's already in completedSections
    4. If all sections are completed, use SUBMIT
    5. If formCompleted is true, use COMPLETE
    
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
      console.log("🤖 AI reasoning:", action.reason);
      return action;
    } catch (error) {
      if ((error as any).status === 429) {
        console.log("Rate limited, waiting 15 seconds...");
        await new Promise(resolve => setTimeout(resolve, 15000));
        return this.decide(currentState);
      }
      console.error("AI decision failed:", error);
      return {
        type: 'RECOVER',
        target: 'retry_analysis',
        reason: 'AI parsing failed, retrying analysis'
      };
    }
  }

  private async act(action: any) {
    try {
      if (action.type === "BATCH_ACTIONS" && action.actions) {
        console.log(`Executing batch of ${action.actions.length} actions`);

        for (const subAction of action.actions) {
          await this.executeSingleAction(subAction);
          this.completedFields.add(subAction.target);
          await this.page.waitForTimeout(200);
        }
        return;
      }

      if (action.type === "OPEN_SECTION") {
        console.log(`Opening section: ${action.target}`);
        
        const sectionButton = await this.page.locator('button').filter({ hasText: action.target }).first();
        if (await sectionButton.isVisible()) {
          await sectionButton.click();
          console.log(`Clicked section button for: ${action.target}`);
        } else {
          console.log(`Section button not found for: ${action.target}`);
        }

        this.completedSections.add(action.target);
        await this.page.waitForTimeout(500);
        return;
      }

      await this.executeSingleAction(action);

    } catch (error) {
      console.log("Action execution failed:", error);
    }
  }

  private async executeSingleAction(action: any) {
    const pageContent = await this.page.evaluate(() => document.body.innerHTML);
    if (pageContent.includes("Form submitted successfully!")) {
      console.log("Form already submitted successfully!");
      return;
    }
    
    const executionPrompt = `
      CRITICAL: Return ONLY raw JSON, no formatting, no markdown, no code blocks.
      The response must start with { and end with }.

      You are an AI that executes actions on web forms.
      
      Action to execute: ${JSON.stringify(action)}
      Current page HTML: ${await this.page.evaluate(() => document.body.innerHTML)}
      
      Return ONLY valid JSON with the exact Playwright command to execute:
      {
        "command": "click|fill|selectOption|waitForSelector",
        "selector": "exact_css_selector_or_text",
        "value": "value_if_needed",
        "reason": "why this command"
      }
    `;

    const response = await generateContent(executionPrompt);
    const responseText = response.text || '';
    
    const start = responseText.indexOf('{');
    const end = responseText.lastIndexOf('}') + 1;
    const jsonText = responseText.substring(start, end);
    
    const execution = JSON.parse(jsonText);

    console.log("Execution plan:", execution.reason);

    switch (execution.command) {
      case 'click':
        await this.page.click(execution.selector);
        break;
      case 'fill':
        await this.page.fill(execution.selector, execution.value);
        break;
      case 'selectOption':
        await this.page.selectOption(execution.selector, execution.value);
        break;
      case 'waitForSelector':
        await this.page.waitForSelector(execution.selector);
        break;
    }
  }
}