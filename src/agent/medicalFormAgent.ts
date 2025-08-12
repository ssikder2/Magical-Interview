import { Page } from "playwright";
import { MEDICAL_FORM_DATA } from "./constants/formData";
import { DecisionModule } from "./modules/decision";
import { ExecutionModule } from "./modules/execution";
import { PerceptionModule } from "./modules/perception";
import { Action, FormData } from "./types";

export class MedicalFormAgent {
  private page: Page;
  private formData: FormData;
  private completedSections: Set<string> = new Set();
  private completedFields: Set<string> = new Set();
  
  private perception: PerceptionModule;
  private decision: DecisionModule;
  private execution: ExecutionModule;

  constructor(page: Page, formData?: FormData) {
    this.page = page;
    this.formData = MEDICAL_FORM_DATA;
    
    this.perception = new PerceptionModule(page);
    this.decision = new DecisionModule(this.formData);
    this.execution = new ExecutionModule(page);
  }

  async run() {
    console.log("Agent starting...");

    while (true) {
      const currentState = await this.perception.perceive(this.completedSections, this.completedFields);

      const action = await this.decision.decide(currentState, this.completedSections, this.completedFields);
      console.log(`Agent decided: ${action.type} - ${action.reason}`);

      await this.act(action);

      if (action.type === "COMPLETE") {
        console.log("Form completed successfully");
        break;
      }
    }
  }

  private async act(action: Action) {
    try {
      if (action.type === "BATCH_ACTIONS" && action.actions) {
        console.log(`Executing batch of ${action.actions.length} actions`);

        for (const subAction of action.actions) {
          await this.execution.executeSingleAction(subAction);
          this.completedFields.add(subAction.target);
          await this.page.waitForTimeout(200);
        }
        return;
      }

      if (action.type === "OPEN_SECTION" && action.target) {
        await this.execution.openSection(action.target);
        this.completedSections.add(action.target);
        await this.page.waitForTimeout(500);
        return;
      }

      if (action.type === "SUBMIT") {
        await this.execution.executeSingleAction({
          action: "click",
          target: "submit",
          value: ""
        });
        return;
      }

      await this.execution.executeSingleAction(action);

    } catch (error) {
      console.log("Action execution failed:", error);
    }
  }
}