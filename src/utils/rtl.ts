import { I18nManager } from 'react-native';
import type { Language } from '../localization';

export function configureNativeDirection(language: Language): void {
  const shouldUseRTL = language === 'ar';
  I18nManager.allowRTL(true);
  I18nManager.swapLeftAndRightInRTL(true);
  if (I18nManager.isRTL !== shouldUseRTL) {
    // Native direction is applied fully on the next app start. Provider-level
    // styles update the visible UI immediately when the language changes.
    I18nManager.forceRTL(shouldUseRTL);
  }
}
