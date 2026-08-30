import Ionicons, {
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../../theme/tokens';
import { AppText } from '../AppText';
import { useLocalization, type TranslationKey } from '../../localization';

const metadata: Record<
  string,
  { labelKey: TranslationKey; icon: IoniconsIconName }
> = {
  Home: { labelKey: 'tabs.home', icon: 'home' },
  Retreat: { labelKey: 'tabs.retreat', icon: 'calendar' },
  House: { labelKey: 'tabs.house', icon: 'chatbox-ellipses' },
  Profile: { labelKey: 'tabs.profile', icon: 'person-outline' },
  More: { labelKey: 'tabs.more', icon: 'ellipsis-horizontal' },
};

export function BottomTabBar({
  state,
  navigation,
  descriptors,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isRTL, t } = useLocalization();
  return (
    <View
      className={`${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center justify-around rounded-t-nav bg-white px-2 pt-2`}
      style={[shadows.card, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const item = metadata[route.name];
        if (!item) return null;
        const label = t(item.labelKey);
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
              descriptors[route.key]?.options.tabBarAccessibilityLabel ?? label
            }
            accessibilityState={focused ? { selected: true } : {}}
            className={`min-w-[58px] items-center rounded-2xl px-2 py-2 ${focused ? 'bg-primary-soft' : ''}`}
            onPress={onPress}>
            <Ionicons name={item.icon} size={23} color={colors.primary} />
            <AppText align="center" className="mt-1 text-caption text-primary">
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
