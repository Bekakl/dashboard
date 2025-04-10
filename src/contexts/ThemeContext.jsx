// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Создаем контекст
const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
    // Состояние для темы.
    // Улучшение: Попробуем прочитать начальное значение из localStorage
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('appTheme');
        return savedTheme ? savedTheme : 'light'; // По умолчанию 'light'
    });

    // Функция для переключения темы
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Улучшение: Сохраняем тему в localStorage при ее изменении
    // И применяем класс к body для CSS стилизации
    useEffect(() => {
        localStorage.setItem('appTheme', theme);
        // Применяем тему к body (или другому корневому элементу)
        document.body.classList.remove('light-theme', 'dark-theme'); // Сначала удаляем старые
        document.body.classList.add(theme === 'light' ? 'light-theme' : 'dark-theme'); // Добавляем текущий
        console.log(`Theme changed to: ${theme}, saved to localStorage.`);
    }, [theme]);

    // Значение контекста
    const value = { theme, toggleTheme };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Хук для использования контекста
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};