import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next'; // Импортируем useTranslation
import { motion } from 'framer-motion'; // Импортируем framer-motion
import '../styles/AuthPage.css';

const RegisterPage = () => {
    const { t } = useTranslation(); // Инициализируем i18next
    const { register } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('password_mismatch')); // Используем локализованное сообщение
            return;
        }

        if (password.length < 6) {
            setError(t('password_length_error')); // Используем локализованное сообщение
            return;
        }

        setLoading(true);

        try {
            console.log(`Попытка регистрации пользователя: ${email}`);
            await register(email, password);
            console.log(`Пользователь ${email} успешно зарегистрирован.`);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || t('registration_error')); // Используем локализованное сообщение
            console.error("Register error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="login-page-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="login-form-box"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2>{t('register_title')}</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="email">{t('email_label')}</label>
                        <input
                            id="email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required disabled={loading}
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="password">{t('password_label')}</label>
                        <input
                            id="password" type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required disabled={loading}
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="confirmPassword">{t('confirm_password_label')}</label>
                        <input
                            id="confirmPassword" type="password" value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required disabled={loading}
                        />
                    </div>
                    <motion.button
                        type="submit"
                        className="button button--submit"
                        disabled={loading}
                        initial={{ scale: 1 }}
                        animate={{ scale: loading ? 0.95 : 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {loading ? t('register_loading') : t('register_button')}
                    </motion.button>
                </form>
                <p style={{ marginTop: '20px', textAlign: 'center' }}>
                    {t('already_have_account')} <Link to="/login">{t('login_link')}</Link>
                </p>
            </motion.div>
        </motion.div>
    );
};

export default RegisterPage;
