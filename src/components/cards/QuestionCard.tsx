import { View } from 'react-native';
import type { QuestionAnswer } from '../../types/business';
import { AppText } from '../AppText';

export function QuestionCard({
  item,
  accent,
}: {
  item: QuestionAnswer;
  accent: string;
}) {
  return (
    <View className="mb-4 rounded-card border border-black/10 bg-white p-3">
      <View
        className="rounded-lg px-3 py-2"
        style={{ backgroundColor: accent }}>
        <AppText className="font-bold">{item.question}</AppText>
      </View>
      <AppText className="mt-2 text-body">• {item.answer}</AppText>
    </View>
  );
}
