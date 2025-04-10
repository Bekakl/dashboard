// src/contexts/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import i18next from '../i18n';


const supportedLanguages = ['en', 'ru', 'kk']; // Список поддерживаемых языков
const defaultLanguage = 'en'; // Язык по умолчанию

// Функция для получения начального языка из localStorage или i18next
const getInitialLanguage = () => {
    try {
        const i18nLang = i18next.language; // Получаем текущий язык из i18next
        if (i18nLang && supportedLanguages.includes(i18nLang.split('-')[0])) {
            return i18nLang.split('-')[0]; // Берем основной код языка (en, ru, kk)
        }
        // Если i18next не помог, смотрим localStorage
        const savedLang = localStorage.getItem('appLanguage');
        return savedLang && supportedLanguages.includes(savedLang) ? savedLang : defaultLanguage;
    } catch (e) {
        console.error('Could not access localStorage/i18next to get language', e);
        return defaultLanguage;
    }
};

// Создаем контекст для языка
const LanguageContext = createContext(undefined);

// Провайдер контекста
export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(getInitialLanguage);

    // Функция смены языка
    const changeLanguage = (lang) => {
        if (supportedLanguages.includes(lang) && lang !== language) {
            setLanguage(lang);
            try {
                localStorage.setItem('appLanguage', lang); // Сохраняем выбранный язык в localStorage
            } catch (e) {
                // Игнорируем ошибку
            }
            i18next.changeLanguage(lang); // Смена языка через i18next
            console.log(`Language changed to: ${lang}`);
        }
    };

    // Эффект для синхронизации с i18next
    useEffect(() => {
        const handleLanguageChanged = (lng) => {
            const newLang = supportedLanguages.includes(lng.split('-')[0]) ? lng.split('-')[0] : defaultLanguage;
            if (language !== newLang) {
                console.log(`Syncing context language to i18next: ${newLang}`);
                setLanguage(newLang);
            }
        };
        i18next.on('languageChanged', handleLanguageChanged);
        return () => {
            i18next.off('languageChanged', handleLanguageChanged);
        };
    }, [language]);

    // Значение, которое будет передано через контекст
    const value = { language, changeLanguage, supportedLanguages };

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// Хук для использования контекста языка
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
