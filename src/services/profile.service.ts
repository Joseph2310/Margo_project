import type { BeneficiaryProfile } from '../types/business';

export interface ProfileService {
  getProfile(): Promise<BeneficiaryProfile>;
  updateProfile(profile: BeneficiaryProfile): Promise<BeneficiaryProfile>;
  linkWhatsAppGroup(): Promise<void>;
}
