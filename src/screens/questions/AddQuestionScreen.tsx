import { useState } from 'react';
import { TextInput } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/tokens';

export function AddQuestionScreen() {
  const [question, setQuestion] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <Screen scroll={false}>
      <AppHeader title="بنك الأسئلة" />
      <AppText className="text-label mb-2">السؤال المقترح</AppText>
      <TextInput
        multiline
        className="h-28 rounded-md bg-input p-3 text-right text-ink"
        selectionColor={colors.primary}
        textAlignVertical="top"
        value={question}
        onChangeText={value => {
          setQuestion(value);
          setSent(false);
        }}
      />
      {sent ? (
        <AppText align="center" className="mt-4 text-primary">
          تم إرسال السؤال المقترح
        </AppText>
      ) : null}
      <PrimaryButton
        className="mb-8 mt-auto"
        label="إرسال!"
        disabled={!question.trim()}
        onPress={() => {
          setSent(true);
          setQuestion('');
        }}
      />
    </Screen>
  );
}
