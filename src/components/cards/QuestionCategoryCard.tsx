import Ionicons, {
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import { Pressable } from 'react-native';
import type { QuestionCategory } from '../../types/business';
import { colors } from '../../theme/tokens';
import { AppText } from '../AppText';

interface Props {
  category: QuestionCategory;
  onPress: () => void;
}

export function QuestionCategoryCard({ category, onPress }: Props) {
  return (
    <Pressable
      className="mb-3 h-24 w-[30%] items-center justify-center rounded-lg active:opacity-80"
      style={{ backgroundColor: category.color }}
      onPress={onPress}>
      <Ionicons
        name={category.icon as IoniconsIconName}
        size={27}
        color={colors.ink}
      />
      <AppText align="center" className="mt-2 text-body">
        {category.title}
      </AppText>
    </Pressable>
  );
}
