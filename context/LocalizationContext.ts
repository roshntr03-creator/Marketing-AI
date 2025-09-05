
import { createContext, useContext } from 'react';
import { Language } from '../types.ts';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const LocalizationContext = createContext<LocalizationContextType>({
  language: Language.AR,
  setLanguage: () => console.warn('no localization provider'),
});

export const useLocalization = () => useContext(LocalizationContext);

export const LocalizationProvider = LocalizationContext.Provider;