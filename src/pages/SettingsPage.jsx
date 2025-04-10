// src/pages/SettingsPage.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Добавили Link для гостя
// Импорты хуков контекста (убедись, что пути верные!)
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
// Импорт i18n (если будешь использовать) и хука для перевода
import { useTranslation } from 'react-i18next'; // <-- Добавили импорт useTranslation
// Импорт стилей (убедись, что путь верный!)
import '../styles/SettingsPage.css';
// Импорт framer-motion для анимации
import { motion } from 'framer-motion';

const SettingsPage = () => {
    // Получаем данные и функции из контекстов
    const { user, logout } = useUser();
    const { theme, toggleTheme } = useTheme();
    const { language, changeLanguage } = useLanguage(); // Используем из LanguageContext
    const navigate = useNavigate();
    const { t } = useTranslation(); // <-- Получаем функцию перевода t()

    // Обработчик выхода
    const handleLogout = () => {
        logout()
            .then(() => { navigate('/login'); })
            .catch(console.error);
    };

    // --- Рендер Компонента ---
    return (
        <motion.div
            className="settings-page page-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {t('Settings')}
            </motion.h1>

            {/* --- Секция Профиля --- */}
            <motion.div
                className="settings-section profile-section"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2>{t('Profile')}</h2>
                {user ? (
                    <>
                        {/* Используем t() с интерполяцией */}
                        <p>{t('LoggedInAs', { email: user.email })}</p>
                        <button onClick={handleLogout} className="button button--danger">{t('Logout')}</button>
                    </>
                ) : (
                    <>
                        {/* Добавь ключ 'GuestMessage' в файлы переводов */}
                        <p>{t('GuestMessage', 'Вы не авторизованы (Гость).')}</p>
                        <button onClick={() => navigate('/login')} className="button">
                            {t('Login')} / {t('Register')} {/* Переводим текст кнопки */}
                        </button>
                    </>
                )}
            </motion.div>

            {/* --- Секция Темы --- */}
            <motion.div
                className="settings-section theme-section"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2>{t('Theme')}</h2>
                <p>
                    {t('CurrentTheme', { context: theme })}
                </p>
                <button onClick={toggleTheme} className="button">
                    {t(theme === 'light' ? 'SwitchToDark' : 'SwitchToLight')}
                </button>
            </motion.div>

            {/* --- Секция Языка --- */}
            <motion.div
                className="settings-section language-section"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2>{t('Language')}</h2>
                <div className="language-selector">
                    <label htmlFor="language-select">{t('SelectLanguage')}</label>
                    <select
                        id="language-select"
                        value={language} // Текущий язык из LanguageContext
                        onChange={(e) => changeLanguage(e.target.value)} // Функция смены языка из LanguageContext
                        className="form-input"
                    >
                        <option value="en">English</option>
                        <option value="ru">Русский</option>
                        <option value="kk">Қазақша</option>
                    </select>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SettingsPage;
