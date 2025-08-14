import { Page } from "playwright";
import { Action, ExecutionPlan, SubAction } from "../../../types";
import { generateContent } from "../../../utils/ai";

export class ExecutionModule {
  constructor(private page: Page) {}

  async executeSingleAction(action: Action | SubAction): Promise<void> {
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
    
    const execution: ExecutionPlan = JSON.parse(jsonText);

    console.log(`Executing: ${execution.command} on ${execution.selector}`);

    switch (execution.command) {
      case 'click':
        await this.page.click(execution.selector);
        break;
      case 'fill':
        await this.page.fill(execution.selector, execution.value || '');
        break;
      case 'selectOption':
        await this.page.selectOption(execution.selector, execution.value || '');
        break;
      case 'waitForSelector':
        await this.page.waitForSelector(execution.selector);
        break;
    }
  }

  async openSection(sectionName: string): Promise<void> {
    console.log(`Opening section: ${sectionName}`);
    
    const sectionButton = await this.page.locator('button').filter({ hasText: sectionName }).first();
    if (await sectionButton.isVisible()) {
      await sectionButton.click();
      console.log(`Clicked section button for: ${sectionName}`);
    } else {
      console.log(`Section button not found for: ${sectionName}`);
    }
  }
}
