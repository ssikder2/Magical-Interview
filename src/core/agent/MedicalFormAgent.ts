import { Page } from "playwright";
import { Action, FormData } from "../../types";
import { DecisionModule } from "./modules/DecisionModule";
import { ExecutionModule } from "./modules/ExecutionModule";
import { PerceptionModule } from "./modules/PerceptionModule";

// Main agent class that orchestrates the complete form-filling process
// Uses an agentic loop: perceive → decide → act → repeat until completion
export class MedicalFormAgent {
  private page: Page;
  private formData: FormData;
  // Track completed sections and fields to avoid redundant work
  private completedSections: Set<string> = new Set();
  private completedFields: Set<string> = new Set();
  
  private perception: PerceptionModule;
  private decision: DecisionModule;
  private execution: ExecutionModule;

  constructor(page: Page, formData: FormData) {
    this.page = page;
    this.formData = formData;
    
    // Initialize specialized modules for each aspect of the agentic loop
    this.perception = new PerceptionModule(page);
    this.decision = new DecisionModule(this.formData);
    this.execution = new ExecutionModule(page);
  }

  // Runs the main agentic loop that continuously analyzes the form and takes actions
  async run() {
    console.log("Agent starting...");

    // Main agentic loop: perceive → decide → act
    while (true) {
      // Extract current page state
      const currentState = await this.perception.perceive(this.completedSections, this.completedFields);

      // Update completion state based on current page state BEFORE making AI decision
      this.updateCompletionState(currentState);

      // AI decides what action to take next (now with updated completion state)
      const action = await this.decision.decide(currentState, this.completedSections, this.completedFields);
      console.log(`Agent decided: ${action.type} - ${action.reason}`);

      // Execute the chosen action
      await this.act(action);

      // Check if form is complete
      if (action.type === "COMPLETE") {
        console.log("Form completed successfully");
        break;
      }
    }
  }

  // Updates the completion tracking state based on current page analysis
  private updateCompletionState(currentState: any) {
    // Mark fields as completed if they already have values
    currentState.visibleFields.forEach((field: any) => {
      if (field.value && field.value.trim() !== '') {
        this.completedFields.add(field.name);
      }
    });

    // Mark sections as completed if they're open and have no unfilled required fields
    currentState.sections.forEach((section: any) => {
      if (section.isOpen) {
        const sectionFields = currentState.visibleFields.filter((field: any) => 
          field.name && this.formData[field.name] !== undefined
        );
        const allFieldsFilled = sectionFields.every((field: any) => 
          this.completedFields.has(field.name)
        );
        if (allFieldsFilled) {
          this.completedSections.add(section.name);
        }
      }
    });
  }

  // Executes the action decided by the AI decision module
  private async act(action: Action) {
    try {
      if (action.type === "BATCH_ACTIONS" && action.actions) {
        // Execute multiple field fills in one action
        console.log(`Executing batch of ${action.actions.length} actions`);

        for (const subAction of action.actions) {
          await this.execution.executeSingleAction(subAction);
          this.completedFields.add(subAction.target);
          await this.page.waitForTimeout(200);
        }
        return;
      }

      if (action.type === "OPEN_SECTION" && action.target) {
        // Only open section if it's not already completed
        if (!this.completedSections.has(action.target)) {
          await this.execution.openSection(action.target);
          this.completedSections.add(action.target);
          console.log(`Completed section: ${action.target}`);
          await this.page.waitForTimeout(500);
        } else {
          console.log(`Section ${action.target} already completed, skipping`);
        }
        return;
      }

      if (action.type === "SUBMIT") {
        // Submit the completed form
        await this.execution.executeSingleAction({
          action: "click",
          target: "submit",
          value: ""
        });
        return;
      }

      // Execute single action for other action types
      await this.execution.executeSingleAction(action);

    } catch (error) {
      console.log("Action execution failed:", error);
    }
  }
}