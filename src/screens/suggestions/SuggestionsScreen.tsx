import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { IdentityToggle } from '../../components/forms/IdentityToggle';
import { RatingControl } from '../../components/forms/RatingControl';
import { colors } from '../../theme/tokens';
import { useSuggestionMutation } from '../../providers/SuggestionsProvider/hooks';
import { Alert } from 'react-native';
import { getApiErrorMessage } from '../../api/errors';
import {
  directionStyles,
  useLocalization,
  type TranslationKey,
} from '../../localization';

const fields = [
  { key: 'general', labelKey: 'suggestions.general' },
  { key: 'lessons', labelKey: 'suggestions.lessons' },
  { key: 'hymns', labelKey: 'suggestions.hymns' },
] as const;

type SuggestionField = (typeof fields)[number] & {
  labelKey: TranslationKey;
};

export function SuggestionsScreen() {
  const { isRTL, t } = useLocalization();
  const [values, setValues] = useState<
    Record<(typeof fields)[number]['key'], string>
  >({ general: '', lessons: '', hymns: '' });
  const [rating, setRating] = useState(0);
  const [anonymous, setAnonymous] = useState(true);
  const [sent, setSent] = useState(false);
  const submitSuggestion = useSuggestionMutation();
  const canSend = Object.values(values).some(Boolean) || rating > 0;
  const submit = async () => {
    try {
      await submitSuggestion.mutateAsync({
        generalSuggestion: values.general,
        lessonSuggestion: values.lessons,
        hymnSuggestion: values.hymns,
        hymnRating: rating,
        anonymous,
      });
      setSent(true);
      setValues({ general: '', lessons: '', hymns: '' });
      setRating(0);
    } catch (error) {
      Alert.alert(t('suggestions.sendError'), getApiErrorMessage(error, t));
    }
  };
  return (
    <Screen>
      <AppHeader title={t('more.suggestions')} />
      {(fields as readonly SuggestionField[]).map(item => (
        <View key={item.key} className="mb-5">
          <AppText className="text-label mb-2">{t(item.labelKey)}</AppText>
          <TextInput
            multiline
            className="h-28 rounded-md bg-input p-3 text-ink"
            selectionColor={colors.primary}
            textAlignVertical="top"
            textAlign={isRTL ? 'right' : 'left'}
            style={isRTL ? directionStyles.rtlText : directionStyles.ltrText}
            value={values[item.key]}
            onChangeText={value => {
              setValues(current => ({ ...current, [item.key]: value }));
              setSent(false);
            }}
          />
        </View>
      ))}
      <AppText className="text-label">{t('suggestions.hymnRating')}</AppText>
      <RatingControl value={rating} onChange={setRating} />
      <View
        className={`my-5 items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <AppText className="text-body">{t('suggestions.sendAs')}</AppText>
        <IdentityToggle anonymous={anonymous} onChange={setAnonymous} />
      </View>
      {sent ? (
        <AppText align="center" className="mb-3 text-primary">
          {t('suggestions.sent')}
        </AppText>
      ) : null}
      <PrimaryButton
        label={t('common.send')}
        disabled={!canSend}
        loading={submitSuggestion.isPending}
        onPress={submit}
      />
    </Screen>
  );
}
