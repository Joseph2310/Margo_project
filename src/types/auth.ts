export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationPayload extends LoginCredentials {
  name: string;
  birthDate: string;
  stage: string;
  address: string;
  phone: string;
  whatsapp: string;
  school: string;
  classSaintName: string;
  confessionFather?: string;
  talents: string[];
  confirmPassword: string;
}

export type VerificationMode = 'activation' | 'registration' | 'passwordReset';

export interface VerificationPayload {
  email: string;
  code: string;
  mode: VerificationMode;
}

export interface AuthSession {
  isAuthenticated: boolean;
  accessToken?: string;
  beneficiaryId?: string;
}
