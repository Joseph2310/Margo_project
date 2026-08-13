import type {
  AuthSession,
  LoginCredentials,
  RegistrationPayload,
  VerificationPayload,
} from '../types/auth';

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  register(payload: RegistrationPayload): Promise<void>;
  verify(payload: VerificationPayload): Promise<AuthSession>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(email: string, password: string): Promise<void>;
  changePassword(currentPassword: string, nextPassword: string): Promise<void>;
}

// The interface is the integration boundary. Its transport implementation is
// intentionally deferred until endpoint paths and DTOs are confirmed.
