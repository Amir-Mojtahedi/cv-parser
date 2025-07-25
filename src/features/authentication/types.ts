export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  company?: string;
  dateOfBirth?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}
