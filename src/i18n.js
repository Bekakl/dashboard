// src/i18n.js

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import kk from './locales/kk.json';
import en from './locales/en.json';

i18next
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ru: { translation: ru },
            kk: { translation: kk },
        },
        lng: localStorage.getItem('appLanguage') || 'en', // Инициализация с языка из localStorage
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18next;
