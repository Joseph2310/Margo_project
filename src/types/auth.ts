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
  isAuthenticated: true;
  accessToken: string;
  refreshToken: string;
  tokenType: 'bearer';
  expiresIn: number;
  beneficiaryId: string;
}

export interface VerificationChallenge {
  email: string;
  mode: VerificationMode;
  expiresInSeconds: number;
  message: string;
  verificationCode?: string;
}

export interface VerificationResult {
  mode: VerificationMode;
  session?: AuthSession;
  passwordResetToken?: string;
  expiresIn?: number;
}

export interface ResetPasswordPayload {
  email: string;
  resetToken: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}
