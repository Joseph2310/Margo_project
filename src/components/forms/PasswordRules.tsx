import { View } from 'react-native';
import { passwordRules } from '../../constants/business';
import { AppText } from '../AppText';
import { TickCircleIcon } from '../icons/TickCircleIcon';

export function PasswordRules({ password }: { password: string }) {
  const states = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    uppercase: /[A-Z]/.test(password),
  };
  return (
    <View className="mb-3 mr-[52px]">
      <AppText className="mb-1 text-caption text-muted">
        شروط كلمة المرور :
      </AppText>
      {passwordRules.map(rule => {
        const valid = states[rule.key];
        return (
          <View key={rule.key} className="flex-row-reverse items-center gap-1">
            <TickCircleIcon active={valid} />
            <AppText className="text-caption text-muted">{rule.label}</AppText>
          </View>
        );
      })}
    </View>
  );
}
