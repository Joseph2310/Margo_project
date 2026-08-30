import { ActivityIndicator, Pressable, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { AppText } from '../AppText';
import { useLocalization } from '../../localization';

interface Props {
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  emptyLabel?: string;
  onRetry?: () => void;
}

export function QueryState({
  loading,
  error,
  empty,
  emptyLabel,
  onRetry,
}: Props) {
  const { t } = useLocalization();
  if (!loading && !error && !empty) return null;
  return (
    <View className="min-h-40 items-center justify-center rounded-card bg-white p-6">
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? (
        <>
          <AppText align="center" className="mb-3 text-body text-muted">
            {t('common.loadError')}
          </AppText>
          {onRetry ? (
            <Pressable onPress={onRetry}>
              <AppText className="text-primary">{t('common.retry')}</AppText>
            </Pressable>
          ) : null}
        </>
      ) : null}
      {empty ? (
        <AppText align="center" className="text-body text-muted">
          {emptyLabel ?? t('common.noData')}
        </AppText>
      ) : null}
    </View>
  );
}
