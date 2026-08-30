import { View } from 'react-native';
import { AppText } from '../AppText';
import { TickCircleIcon } from '../icons/TickCircleIcon';
import { useLocalization } from '../../localization';

export function PasswordRules({ password }: { password: string }) {
  const { isRTL, t } = useLocalization();
  const passwordRules = [
    { key: 'length', label: t('passwordRules.length') },
    { key: 'number', label: t('passwordRules.number') },
    { key: 'uppercase', label: t('passwordRules.uppercase') },
  ] as const;
  const states = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    uppercase: /[A-Z]/.test(password),
  };
  return (
    <View className={`mb-3 ${isRTL ? 'mr-[52px]' : 'ml-[52px]'}`}>
      <AppText className="mb-1 text-caption text-muted">
        {t('passwordRules.title')}
      </AppText>
      {passwordRules.map(rule => {
        const valid = states[rule.key];
        return (
          <View
            key={rule.key}
            className={`items-center gap-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <TickCircleIcon active={valid} />
            <AppText className="text-caption text-muted">{rule.label}</AppText>
          </View>
        );
      })}
    </View>
  );
}
