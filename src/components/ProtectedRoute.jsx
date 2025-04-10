// src/components/ProtectedRoute.jsx (Примерная реализация)
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useUser(); // Берем пользователя из контекста
    const location = useLocation();

    // Если пользователя нет (null - гость или не вошел)
    if (!user) {
        // Перенаправляем на /login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Если пользователь есть - показываем запрошенную страницу
    return children;
};
export default ProtectedRoute;