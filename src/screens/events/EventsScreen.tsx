import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { EventCard } from '../../components/cards/EventCard';
import { QueryState } from '../../components/feedback/QueryState';
import { useEventsQuery } from '../../providers/EventsProvider/hooks';
import { useLocalization } from '../../localization';
import { formatMonthYear, formatWeekdayNarrow } from '../../utils/format';

const days = [
  { date: new Date(Date.UTC(2026, 2, 29)), value: 1 },
  { date: new Date(Date.UTC(2026, 2, 30)), value: 2 },
  { date: new Date(Date.UTC(2026, 2, 31)), value: 3 },
  { date: new Date(Date.UTC(2026, 3, 1)), value: 4 },
  { date: new Date(Date.UTC(2026, 3, 2)), value: 5 },
  { date: new Date(Date.UTC(2026, 3, 3)), value: 6 },
  { date: new Date(Date.UTC(2026, 3, 4)), value: 7 },
];

export function EventsScreen() {
  const { formatNumber, isRTL, language, t } = useLocalization();
  const [selected, setSelected] = useState(4);
  const events = useEventsQuery();
  return (
    <Screen>
      <AppHeader title={t('home.upcomingEvents')} />
      <View className="mb-6 rounded-card border border-line bg-white p-3">
        <AppText align="center" className="mb-3 text-body">
          ‹　{formatMonthYear(new Date(2026, 3, 1), language)}　›
        </AppText>
        <View
          className={`justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          {days.map(day => (
            <Pressable
              key={day.value}
              className="items-center"
              onPress={() => setSelected(day.value)}>
              <AppText
                align="center"
                className={day.value === selected ? 'text-primary' : ''}>
                {formatWeekdayNarrow(day.date, language)}
              </AppText>
              <View
                className={`mt-2 h-9 w-9 items-center justify-center rounded-full ${day.value === selected ? 'bg-primary' : 'bg-primary-soft'}`}>
                <AppText
                  align="center"
                  className={
                    day.value === selected ? 'text-white' : 'text-muted'
                  }>
                  {formatNumber(day.value)}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      <QueryState
        loading={events.isLoading}
        error={events.isError}
        empty={!events.isLoading && !events.data?.length}
        emptyLabel={t('events.empty')}
        onRetry={() => events.refetch()}
      />
      {events.data?.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </Screen>
  );
}
