import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';

interface Props extends PropsWithChildren {
  scroll?: boolean;
  padded?: boolean;
  className?: string;
  contentClassName?: string;
  bottomInset?: boolean;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  className = '',
  contentClassName = '',
  bottomInset = true,
}: Props) {
  const content = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={`${padded ? 'px-screen' : ''} pb-8 ${contentClassName}`}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${padded ? 'px-screen' : ''} ${contentClassName}`}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={bottomInset ? ['top', 'bottom'] : ['top']}
      className={`flex-1 bg-canvas ${className}`}
      style={{ backgroundColor: colors.canvas }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
