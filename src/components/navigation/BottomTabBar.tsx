import Ionicons, {
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../../theme/tokens';
import { AppText } from '../AppText';

const metadata: Record<string, { label: string; icon: IoniconsIconName }> = {
  Home: { label: 'الرئيسية', icon: 'home' },
  Retreat: { label: 'الخلوة', icon: 'calendar' },
  House: { label: 'البيت', icon: 'chatbox-ellipses' },
  Profile: { label: 'البروفايل', icon: 'person-outline' },
  More: { label: 'المزيد', icon: 'ellipsis-horizontal' },
};

export function BottomTabBar({
  state,
  navigation,
  descriptors,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center justify-around rounded-t-nav bg-white px-2 pt-2"
      style={[shadows.card, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const item = metadata[route.name];
        if (!item) return null;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented)
            navigation.navigate(route.name, route.params);
        };
        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityLabel={
              descriptors[route.key]?.options.tabBarAccessibilityLabel ??
              item.label
            }
            accessibilityState={focused ? { selected: true } : {}}
            className={`min-w-[58px] items-center rounded-2xl px-2 py-2 ${focused ? 'bg-primary-soft' : ''}`}
            onPress={onPress}>
            <Ionicons name={item.icon} size={23} color={colors.primary} />
            <AppText align="center" className="mt-1 text-caption text-primary">
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
