import Ionicons from '@react-native-vector-icons/ionicons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { QueryState } from '../../components/feedback/QueryState';
import {
  useCompleteReflectionMutation,
  useReflectionQuery,
} from '../../providers/RetreatProvider/hooks';
import { colors } from '../../theme/tokens';
import { Alert } from 'react-native';
import { getApiErrorMessage } from '../../api/errors';
import { useLocalization } from '../../localization';

export function ReflectionScreen() {
  const { formatNumber, isRTL, t } = useLocalization();
  const reflection = useReflectionQuery();
  const completeReflection = useCompleteReflectionMutation();
  const [completed, setCompleted] = useState(false);
  const complete = async () => {
    if (!reflection.data || reflection.data.completed || completed) return;
    try {
      await completeReflection.mutateAsync(reflection.data.id);
      setCompleted(true);
    } catch (error) {
      Alert.alert(t('reflection.completeError'), getApiErrorMessage(error, t));
    }
  };
  return (
    <Screen>
      <AppHeader title={t('reflection.title')} />
      <QueryState
        loading={reflection.isLoading}
        error={reflection.isError}
        onRetry={() => reflection.refetch()}
      />
      {reflection.data ? (
        <>
          <AppText align="center" className="text-label font-bold text-lesson">
            {reflection.data.date}
          </AppText>
          <AppText align="center" className="mt-3 text-title font-bold">
            {reflection.data.title}
          </AppText>
          <AppText className="text-label mb-2 mt-7">
            {t('reflection.lessonPoints')}
          </AppText>
          {reflection.data.points.map((point, index) => (
            <AppText key={point} className="mb-1 text-body">
              {formatNumber(index + 1)}. {point}
            </AppText>
          ))}
          <View
            className={`mt-8 items-start gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <View className="flex-1">
              <AppText className="text-label">
                {t('reflection.exercise')}
              </AppText>
              {reflection.data.exercisePoints ? (
                <AppText className="mt-1 text-caption text-muted">
                  🪙{' '}
                  {t('common.points', {
                    count: formatNumber(reflection.data.exercisePoints),
                  })}
                </AppText>
              ) : null}
            </View>
            <Pressable onPress={complete}>
              <Ionicons
                name={
                  completed || reflection.data.completed
                    ? 'checkbox'
                    : 'square-outline'
                }
                size={27}
                color={colors.primary}
              />
            </Pressable>
          </View>
          <AppText className="mt-3 text-body">
            {reflection.data.exercise}
          </AppText>
        </>
      ) : null}
    </Screen>
  );
}
