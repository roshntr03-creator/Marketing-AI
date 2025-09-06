import { createContext, useContext } from 'react';
import { Language } from '../types.ts';

interface LocalizationContextType {
  language: Language;
  toggleLanguage: () => void;
}

export const LocalizationContext = createContext<LocalizationContextType>({
  language: Language.AR,
  toggleLanguage: () => console.warn('no localization provider'),
});

export const useLocalization = () => useContext(LocalizationContext);

export const LocalizationProvider = LocalizationContext.Provider;
