export interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  medicalId: string;
  gender: string;
  bloodType: string;
  allergies: string;
  currentMedications: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export interface Section {
  name: string;
  isOpen: boolean;
}

export interface Field {
  name: string;
  type: string;
  value: string;
  isVisible: boolean;
}

export interface PageState {
  sections: Section[];
  visibleFields: Field[];
  formCompleted: boolean;
  completedSections: string[];
  completedFields: string[];
}

export interface SubAction {
  action: string;
  target: string;
  value: string;
}

export interface Action {
  type: 'BATCH_ACTIONS' | 'OPEN_SECTION' | 'SUBMIT' | 'COMPLETE' | 'RECOVER';
  actions?: SubAction[];
  target?: string;
  reason: string;
}

export interface ExecutionPlan {
  command: 'click' | 'fill' | 'selectOption' | 'waitForSelector';
  selector: string;
  value?: string;
  reason: string;
}
