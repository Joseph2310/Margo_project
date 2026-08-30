import { useEffect } from 'react';
import { Image, View } from 'react-native';
import { completeSplash } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/tokens';
import { useRefreshSessionMutation } from '../../providers/AuthProvider/hooks';
import { signIn, signOut } from '../../store/authSlice';
import { useLocalization } from '../../localization';

export function SplashScreen() {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const refreshToken = useAppSelector(state => state.auth.refreshToken);
  const { mutateAsync: refreshSession } = useRefreshSessionMutation();

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      dispatch(completeSplash());
      if (!refreshToken) {
        return;
      }
      try {
        const session = await refreshSession(refreshToken);
        if (!active) return;
        dispatch(signIn(session));
      } catch {
        if (!active) return;
        dispatch(signOut());
      }
    }, 900);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [dispatch, refreshSession, refreshToken]);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.primary }}>
      <Image
        accessibilityLabel={t('common.appLogo')}
        source={require('../../assets/images/splash.png')}
        className="h-full w-full"
        resizeMode="cover"
      />
    </View>
  );
}
