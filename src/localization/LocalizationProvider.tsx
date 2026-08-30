import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type PropsWithChildren,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setApiLanguage } from '../api/apiClient';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLanguage as setStoredLanguage } from '../store/uiSlice';
import { configureNativeDirection } from '../utils/rtl';
import { translate, type Translate } from './translate';
import type { Language } from './types';

interface LocalizationValue {
  language: Language;
  locale: 'ar-EG' | 'en-US';
  isRTL: boolean;
  direction: 'rtl' | 'ltr';
  t: Translate;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  formatNumber: (value: number | string) => string;
}

const LocalizationContext = createContext<LocalizationValue | undefined>(
  undefined,
);

export function LocalizationProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const language = useAppSelector(state => state.ui.language);
  const previousLanguage = useRef(language);
  const isRTL = language === 'ar';
  const locale = isRTL ? 'ar-EG' : 'en-US';
  setApiLanguage(language);

  useEffect(() => {
    configureNativeDirection(language);
    if (previousLanguage.current !== language) {
      previousLanguage.current = language;
      queryClient.invalidateQueries();
    }
  }, [language, queryClient]);

  const t = useCallback<Translate>(
    (key, params) => translate(language, key, params),
    [language],
  );
  const setLanguage = useCallback(
    (nextLanguage: Language) => dispatch(setStoredLanguage(nextLanguage)),
    [dispatch],
  );
  const toggleLanguage = useCallback(
    () => setLanguage(language === 'ar' ? 'en' : 'ar'),
    [language, setLanguage],
  );
  const formatNumber = useCallback(
    (value: number | string) => {
      const numericValue = Number(value);
      return Number.isFinite(numericValue)
        ? new Intl.NumberFormat(locale).format(numericValue)
        : String(value);
    },
    [locale],
  );
  const value = useMemo<LocalizationValue>(
    () => ({
      language,
      locale,
      isRTL,
      direction: isRTL ? 'rtl' : 'ltr',
      t,
      setLanguage,
      toggleLanguage,
      formatNumber,
    }),
    [formatNumber, isRTL, language, locale, setLanguage, t, toggleLanguage],
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization(): LocalizationValue {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
}
