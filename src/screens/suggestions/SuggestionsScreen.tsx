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

const fields = [
  { key: 'general', label: 'اقتراحاتك لمدارس الاحد' },
  { key: 'lessons', label: 'اقتراحاتك لدروس مدارس الاحد' },
  { key: 'hymns', label: 'اقتراحاتك لترانيم مدارس الاحد' },
] as const;

export function SuggestionsScreen() {
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
      Alert.alert('تعذر إرسال المقترحات', getApiErrorMessage(error));
    }
  };
  return (
    <Screen>
      <AppHeader title="الاقتراحات" />
      {fields.map(item => (
        <View key={item.key} className="mb-5">
          <AppText className="text-label mb-2">{item.label}</AppText>
          <TextInput
            multiline
            className="h-28 rounded-md bg-input p-3 text-right text-ink"
            selectionColor={colors.primary}
            textAlignVertical="top"
            value={values[item.key]}
            onChangeText={value => {
              setValues(current => ({ ...current, [item.key]: value }));
              setSent(false);
            }}
          />
        </View>
      ))}
      <AppText className="text-label">تقييم ترانيم مدارس الاحد</AppText>
      <RatingControl value={rating} onChange={setRating} />
      <View className="my-5 flex-row-reverse items-center justify-between">
        <AppText className="text-body">ارسال المقترحات :</AppText>
        <IdentityToggle anonymous={anonymous} onChange={setAnonymous} />
      </View>
      {sent ? (
        <AppText align="center" className="mb-3 text-primary">
          تم إرسال المقترحات
        </AppText>
      ) : null}
      <PrimaryButton
        label="إرسال"
        disabled={!canSend}
        loading={submitSuggestion.isPending}
        onPress={submit}
      />
    </Screen>
  );
}
