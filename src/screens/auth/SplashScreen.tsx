import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Image, View } from 'react-native';
import type { RootStackParamList } from '../../types/navigation';
import { completeSplash } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(completeSplash());
      navigation.replace(isAuthenticated ? 'Main' : 'Login');
    }, 900);
    return () => clearTimeout(timer);
  }, [dispatch, isAuthenticated, navigation]);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.primary }}>
      <Image
        accessibilityLabel="شعار التطبيق"
        source={require('../../assets/images/splash.png')}
        className="h-full w-full"
        resizeMode="cover"
      />
    </View>
  );
}
