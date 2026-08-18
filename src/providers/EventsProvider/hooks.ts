import { useQuery } from '@tanstack/react-query';
import { eventsService } from '../../services/eventsService';
import { queryKeys } from '../queryKeys';

export const useEventsQuery = () =>
  useQuery({
    queryKey: queryKeys.events,
    queryFn: () => eventsService.getUpcomingEvents(),
  });
