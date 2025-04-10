// src/components/Navbar.jsx
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import '../styles/Navbar.css'; // Подключаем стили

const Navbar = () => {
    const { user, logout } = useUser();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Логика для выхода (например, очистка данных сессии, редирект и т.д.)
        logout();
        navigate('/');
    };

    const getNavLinkClass = ({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link';

    return (
        <nav className="navbar page-container">
            <Link to="/" className="navbar-logo">
                {t('AppTitle', 'Project Dashboard')}
            </Link>

            <div className="navbar-links">
                <NavLink to="/dashboard" className={getNavLinkClass}> {t('Dashboard', 'Дашборд')} </NavLink>
                <NavLink to="/settings" className={getNavLinkClass}> {t('Settings', 'Настройки')} </NavLink>
                <NavLink to="/contact" className={getNavLinkClass}> {t('Contact', 'Контакты')} </NavLink>

                {user ? (
                    <button onClick={handleLogout} className="nav-link button--logout"> {t('Logout', 'Выйти')} </button>
                ) : (
                    <NavLink to="/login" className="nav-link button--login"> {t('Login', 'Войти')} </NavLink>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
