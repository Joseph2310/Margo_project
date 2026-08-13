import { Pressable, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { AppText } from '../AppText';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function RatingControl({ value, onChange }: Props) {
  return (
    <View className="my-4 flex-row-reverse items-start justify-between px-2">
      {[1, 2, 3, 4, 5].map(rating => (
        <Pressable
          key={rating}
          className="items-center"
          onPress={() => onChange(rating)}>
          <View
            className="h-5 w-5 rounded-full border"
            style={{
              borderColor: colors.primary,
              backgroundColor:
                rating === value ? colors.primary : colors.surface,
            }}
          />
          <AppText align="center" className="text-small mt-1 text-primary">
            {rating}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
