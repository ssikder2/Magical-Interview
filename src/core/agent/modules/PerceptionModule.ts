import { Page } from "playwright";
import { PageState } from "../../../types";

/**
 * PerceptionModule extracts and analyzes the current state of a web form.
 * It identifies visible fields, form sections, and completion status to provide
 * the agent with accurate information about what needs to be filled.
 */
export class PerceptionModule {
  constructor(private page: Page) {}

  async perceive(completedSections: Set<string>, completedFields: Set<string>): Promise<PageState> {
    const state = await this.page.evaluate(() => {
      // Find all section buttons (collapsible form sections)
      const sections = document.querySelectorAll('form button');
      
      // Find all form input elements currently visible on the page
      const visibleFields = document.querySelectorAll('input, select, textarea');

      // Check for success/completion indicators in the page content
      const successIndicators = document.querySelectorAll('[class*="success"], [class*="complete"], [class*="done"], [id*="success"], [id*="complete"]');
      const hasSuccessMessage = successIndicators.length > 0 || document.body.textContent?.includes('success') || document.body.textContent?.includes('complete');

      return {
        // Extract section information with open/closed state
        sections: Array.from(sections)
          .map(btn => ({
            name: btn.textContent?.trim(),
            isOpen: btn.getAttribute('aria-expanded') === 'true'
          }))
          .filter(section => section.name !== undefined && section.name !== '')
          .map(section => ({ name: section.name!, isOpen: section.isOpen })),
        
        // Extract field information with type and current values
        visibleFields: Array.from(visibleFields).map(field => {
          if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
            // Try to get a meaningful identifier for the field
            let fieldName = field.name || field.id || '';
            
            // Add placeholder for input and textarea elements
            if ((field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) && field.placeholder) {
              fieldName = fieldName || field.placeholder;
            }
      
            return {  
              name: fieldName,
              type: field.type || field.tagName.toLowerCase(),
              value: field.value,
              isVisible: field.offsetParent !== null
            };
          }
          return null;
        }).filter((field): field is { name: string; type: string; value: string; isVisible: boolean } => 
          field !== null && field.name !== ''
        ),
        
        // Determine if form has been successfully submitted
        formCompleted: hasSuccessMessage || false
      };
    });
    
    // Return the page state with completion tracking information
    return {
      ...state,
      completedSections: Array.from(completedSections),
      completedFields: Array.from(completedFields)
    };
  }
}
