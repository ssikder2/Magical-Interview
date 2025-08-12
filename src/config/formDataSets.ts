
export interface FormDataSet {
  name: string;
  url: string;
  formData: Record<string, string>;
}

export const FORM_DATA_SETS: FormDataSet[] = [
  {
    name: 'Medical Form - Set 1',
    url: 'https://magical-medical-form.netlify.app/',
    formData: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      medicalId: '12345',
      gender: 'Male',
      bloodType: 'O+',
      allergies: '',
      currentMedications: '',
      emergencyContact: 'Jane Doe',
      emergencyPhone: '555-1234'
    }
  },
  {
    name: 'Medical Form - Set 2',
    url: 'https://magical-medical-form.netlify.app/',
    formData: {
      firstName: 'Sarah',
      lastName: 'Smith',
      dateOfBirth: '1985-05-15',
      medicalId: '67890',
      gender: 'Female',
      bloodType: 'A+',
      allergies: 'Peanuts',
      currentMedications: 'Vitamin D',
      emergencyContact: 'Mike Smith',
      emergencyPhone: '555-5678'
    }
  },
  {
    name: 'Medical Form - Set 3',
    url: 'https://magical-medical-form.netlify.app/',
    formData: {
      firstName: 'Mike',
      lastName: 'Johnson',
      dateOfBirth: '1988-12-03',
      medicalId: '11111',
      gender: 'Male',
      bloodType: 'B-',
      allergies: 'Shellfish',
      currentMedications: 'None',
      emergencyContact: 'Lisa Johnson',
      emergencyPhone: '555-9999'
    }
  }
];