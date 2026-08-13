import { I18nManager } from 'react-native';

I18nManager.allowRTL(true);
I18nManager.swapLeftAndRightInRTL(true);

if (!I18nManager.isRTL) {
  // The change is applied by React Native on the next native reload.
  I18nManager.forceRTL(true);
}
