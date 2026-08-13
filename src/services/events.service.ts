import type { BeneficiaryEvent } from '../types/business';

export interface EventsService {
  getUpcomingEvents(): Promise<BeneficiaryEvent[]>;
}
