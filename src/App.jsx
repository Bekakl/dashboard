import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Импорты для анимации
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Provider as ReduxProvider } from 'react-redux';
import store from './store';

import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import SettingsPage from './pages/SettingsPage';
import Error404 from './pages/errors/Error404';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';

// Компонент для анимации страниц
const AnimatedPage = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
    >
        {children}
    </motion.div>
);

// Главный компонент маршрутов
function AppRoutes() {
    return (
        <AnimatePresence mode="wait">
            <Routes>
                <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
                <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
                <Route path="/register" element={<AnimatedPage><RegisterPage /></AnimatedPage>} />
                <Route path="/dashboard" element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
                <Route path="/project/:id" element={<AnimatedPage><ProjectDetailsPage /></AnimatedPage>} />
                <Route path="/settings" element={<AnimatedPage><SettingsPage /></AnimatedPage>} />
                <Route path="/contact" element={<AnimatedPage><ContactPage /></AnimatedPage>} />
                <Route path="*" element={<Error404 />} />
            </Routes>
        </AnimatePresence>
    );
}

// Основной компонент приложения
function App() {
    return (
        <ReduxProvider store={store}>
            <UserProvider>
                <ThemeProvider>
                    <LanguageProvider>
                        <Navbar /> {/* Навбар вынесен сюда */}
                        <div className="main-content">
                            <AppRoutes /> {/* Рендерим маршруты */}
                        </div>
                    </LanguageProvider>
                </ThemeProvider>
            </UserProvider>
        </ReduxProvider>
    );
}

export default App;
