import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { EventCard } from '../../components/cards/EventCard';
import { QueryState } from '../../components/feedback/QueryState';
import { useEventsQuery } from '../../providers/EventsProvider/hooks';

const days = [
  { letter: 'S', value: 1 },
  { letter: 'M', value: 2 },
  { letter: 'T', value: 3 },
  { letter: 'W', value: 4 },
  { letter: 'T', value: 5 },
  { letter: 'F', value: 6 },
  { letter: 'S', value: 7 },
];

export function EventsScreen() {
  const [selected, setSelected] = useState(4);
  const events = useEventsQuery();
  return (
    <Screen>
      <AppHeader title="الاحداث القادمة" />
      <View className="mb-6 rounded-card border border-line bg-white p-3">
        <AppText align="center" className="mb-3 text-body">
          ‹　2026 إبريل　›
        </AppText>
        <View className="flex-row justify-between">
          {days.map(day => (
            <Pressable
              key={`${day.letter}-${day.value}`}
              className="items-center"
              onPress={() => setSelected(day.value)}>
              <AppText
                align="center"
                className={day.value === selected ? 'text-primary' : ''}>
                {day.letter}
              </AppText>
              <View
                className={`mt-2 h-9 w-9 items-center justify-center rounded-full ${day.value === selected ? 'bg-primary' : 'bg-primary-soft'}`}>
                <AppText
                  align="center"
                  className={
                    day.value === selected ? 'text-white' : 'text-muted'
                  }>
                  {day.value}
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
        emptyLabel="لا توجد أحداث قادمة"
        onRetry={() => events.refetch()}
      />
      {events.data?.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </Screen>
  );
}
