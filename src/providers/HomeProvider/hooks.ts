import { useQuery } from '@tanstack/react-query';
import { homeService } from '../../services/homeService';
import { queryKeys } from '../queryKeys';

export const useHomeQuery = () =>
  useQuery({ queryKey: queryKeys.home, queryFn: homeService.getDashboard });

export const useDailyReadingQuery = () =>
  useQuery({
    queryKey: queryKeys.dailyReading,
    queryFn: homeService.getDailyReading,
  });
