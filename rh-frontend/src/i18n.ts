import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import our translation files
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';

// The translations
const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en', // Use English if the detected language is not available
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;