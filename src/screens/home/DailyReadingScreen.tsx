import { View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { QueryState } from '../../components/feedback/QueryState';
import { useDailyReadingQuery } from '../../providers/HomeProvider/hooks';
import { useLocalization } from '../../localization';

export function DailyReadingScreen() {
  const { t } = useLocalization();
  const reading = useDailyReadingQuery();
  return (
    <Screen>
      <AppHeader title={t('home.dailyReading')} />
      <QueryState
        loading={reading.isLoading}
        error={reading.isError}
        onRetry={() => reading.refetch()}
      />
      {reading.data ? (
        <View className="h-52 justify-end rounded-card bg-reading p-5">
          <AppText className="text-small text-white">
            {reading.data.title}
          </AppText>
          <AppText className="mt-2 text-3xl font-bold text-white">
            {reading.data.reference}
          </AppText>
          <AppText className="mt-2 text-body text-white">
            {reading.data.date}
          </AppText>
        </View>
      ) : null}
    </Screen>
  );
}
