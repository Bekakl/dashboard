// src/contexts/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
// Импортируем нужные функции из Firebase Auth SDK v9+
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword // Для регистрации
} from 'firebase/auth';
// --- ИСПРАВЬ ПУТЬ, ЕСЛИ ТВОЙ firebase.js В ДРУГОЙ ПАПКЕ ---
import { app } from './firebase'; // Импортируем инициализированное Firebase приложение 'app'

// Получаем экземпляр Auth
const auth = getAuth(app);
// Создаем экземпляр Google провайдера
const googleProvider = new GoogleAuthProvider();

// Создаем React Context
const UserContext = createContext(undefined);

// Компонент-провайдер
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Состояние пользователя
    const [loading, setLoading] = useState(true); // Состояние начальной загрузки

    // Эффект для подписки на изменения статуса аутентификации
    useEffect(() => {
        console.log("UserProvider: Подписка на onAuthStateChanged...");
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            console.log('[UserContext] Auth state changed, user:', currentUser?.email || 'logged out');
        });
        // Функция очистки при размонтировании
        return () => {
            console.log("UserProvider: Отписка от onAuthStateChanged.");
            unsubscribe();
        }
    }, []); // Пустой массив зависимостей - запускается один раз

    // Функция входа по Email/Password
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Функция входа через Google
    const signInWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    // Функция регистрации по Email/Password
    const register = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // Функция выхода
    const logout = () => {
        return signOut(auth);
    };

    // Значение, которое будет передано через контекст
    const value = {
        user,     // Текущий пользователь (или null)
        loading,  // Флаг начальной загрузки
        login,    // Функция входа по email
        logout,   // Функция выхода
        signInWithGoogle, // Функция входа через Google
        register  // Функция регистрации
    };

    // Рендерим дочерние компоненты только после определения статуса аутентификации
    return (
        <UserContext.Provider value={value}>
            {!loading ? children : <div>Загрузка пользователя...</div> /* Или спиннер */}
        </UserContext.Provider>
    );
};

// Кастомный хук для удобного использования контекста
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        // Эта ошибка возникает, если useUser используется вне UserProvider
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// НЕ экспортируем LanguageProvider и useLanguage отсюда!
// export { LanguageProvider, useLanguage }; <--- УДАЛИ ЭТО, ЕСЛИ БЫЛО