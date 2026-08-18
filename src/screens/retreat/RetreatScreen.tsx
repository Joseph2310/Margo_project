import { useState } from 'react';
import { TextInput } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { ActivityCard } from '../../components/cards/ActivityCard';
import { QueryState } from '../../components/feedback/QueryState';
import {
  useActivitiesQuery,
  useRetreatSubmissionMutation,
} from '../../providers/RetreatProvider/hooks';
import { colors } from '../../theme/tokens';
import { Alert } from 'react-native';
import { getApiErrorMessage } from '../../api/errors';

export function RetreatScreen() {
  const activities = useActivitiesQuery();
  const submitRetreat = useRetreatSubmissionMutation();
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');
  const [sent, setSent] = useState(false);

  const toggle = (id: string) =>
    setCheckedIds(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id],
    );

  const submit = async () => {
    try {
      await submitRetreat.mutateAsync({
        activityIds: checkedIds,
        reflection: reflection.trim() || undefined,
      });
      setSent(true);
      setCheckedIds([]);
      setReflection('');
    } catch (error) {
      Alert.alert('تعذر الإرسال', getApiErrorMessage(error));
    }
  };

  return (
    <Screen bottomInset={false}>
      <AppHeader title="الخلوة" />
      <QueryState
        loading={activities.isLoading}
        error={activities.isError}
        onRetry={() => activities.refetch()}
      />
      {activities.data?.map(activity => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          checked={checkedIds.includes(activity.id)}
          onToggle={() => toggle(activity.id)}
        />
      ))}
      <AppText className="text-label mb-2 mt-4">شاركينا بتأملك</AppText>
      <TextInput
        multiline
        className="h-32 rounded-md bg-input p-3 text-right text-ink"
        selectionColor={colors.primary}
        textAlignVertical="top"
        value={reflection}
        onChangeText={value => {
          setReflection(value);
          setSent(false);
        }}
      />
      {sent ? (
        <AppText align="center" className="mt-3 text-primary">
          تم الإرسال
        </AppText>
      ) : null}
      <PrimaryButton
        className="mt-8"
        label="إرسال"
        disabled={!reflection.trim() && checkedIds.length === 0}
        loading={submitRetreat.isPending}
        onPress={submit}
      />
    </Screen>
  );
}
