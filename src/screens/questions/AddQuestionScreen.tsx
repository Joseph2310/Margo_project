import { useState } from 'react';
import { Alert } from 'react-native';
import { TextInput } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/tokens';
import { useProposeQuestionMutation } from '../../providers/QuestionsProvider/hooks';
import { getApiErrorMessage } from '../../api/errors';
import { directionStyles, useLocalization } from '../../localization';

export function AddQuestionScreen() {
  const { isRTL, t } = useLocalization();
  const [question, setQuestion] = useState('');
  const [sent, setSent] = useState(false);
  const proposeQuestion = useProposeQuestionMutation();
  const send = async () => {
    try {
      await proposeQuestion.mutateAsync(question.trim());
      setSent(true);
      setQuestion('');
    } catch (error) {
      Alert.alert(t('questions.sendError'), getApiErrorMessage(error, t));
    }
  };
  return (
    <Screen scroll={false}>
      <AppHeader title={t('home.questionBank')} />
      <AppText className="text-label mb-2">{t('questions.proposed')}</AppText>
      <TextInput
        multiline
        className="h-28 rounded-md bg-input p-3 text-ink"
        selectionColor={colors.primary}
        textAlignVertical="top"
        textAlign={isRTL ? 'right' : 'left'}
        style={isRTL ? directionStyles.rtlText : directionStyles.ltrText}
        value={question}
        onChangeText={value => {
          setQuestion(value);
          setSent(false);
        }}
      />
      {sent ? (
        <AppText align="center" className="mt-4 text-primary">
          {t('questions.sent')}
        </AppText>
      ) : null}
      <PrimaryButton
        className="mb-8 mt-auto"
        label={t('common.send')}
        disabled={!question.trim()}
        loading={proposeQuestion.isPending}
        onPress={send}
      />
    </Screen>
  );
}
