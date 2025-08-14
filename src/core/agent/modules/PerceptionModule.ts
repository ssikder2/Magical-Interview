import { Page } from "playwright";
import { PageState } from "../../../types";

export class PerceptionModule {
  constructor(private page: Page) {}

  async perceive(completedSections: Set<string>, completedFields: Set<string>): Promise<PageState> {
    const state = await this.page.evaluate(() => {
      const sections = document.querySelectorAll('form button');
      const visibleFields = document.querySelectorAll('input, select, textarea');

      const successIndicators = document.querySelectorAll('[class*="success"], [class*="complete"], [class*="done"], [id*="success"], [id*="complete"]');
      const hasSuccessMessage = successIndicators.length > 0 || document.body.textContent?.includes('success') || document.body.textContent?.includes('complete');

      return {
        sections: Array.from(sections)
          .map(btn => ({
            name: btn.textContent?.trim(),
            isOpen: btn.getAttribute('aria-expanded') === 'true'
          }))
          .filter(section => section.name !== undefined && section.name !== '')
          .map(section => ({ name: section.name!, isOpen: section.isOpen })),
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
        }).filter((field): field is { name: string; type: string; value: string; isVisible: boolean } => field !== null),
        formCompleted: hasSuccessMessage || false
      };
    });
    
    return {
      ...state,
      completedSections: Array.from(completedSections),
      completedFields: Array.from(completedFields)
    };
  }
}
