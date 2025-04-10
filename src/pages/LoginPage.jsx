import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next'; // Импортируем useTranslation
import { motion } from 'framer-motion'; // Импортируем framer-motion
import '../styles/AuthPage.css';

const LoginPage = () => {
    const { t } = useTranslation(); // Инициализируем i18next
    const { login, signInWithGoogle } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || t('login_error')); // Используем локализованное сообщение
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        try {
            const result = await signInWithGoogle();
            navigate(from, { replace: true });
        } catch (error) {
            setError(error.message || t('google_login_error')); // Используем локализованное сообщение
            console.error('Google Sign-In Error:', error);
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
                <h2>{t('login_title')}</h2>
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
                    <button type="submit" className="button button--submit" disabled={loading}>
                        {loading ? t('login_loading') : t('login_button')}
                    </button>
                </form>

                <div className="divider" style={{ textAlign: 'center', margin: '20px 0', color: '#aaa' }}>
                    {t('or')}
                </div>

                <motion.button
                    type="button"
                    className="button button--google"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 48 48">
                        <g>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                        </g>
                    </svg>
                    <span>{t('google_sign_in_button')}</span>
                </motion.button>

                <p style={{ marginTop: '20px', textAlign: 'center' }}>
                    {t('no_account')} <Link to="/register">{t('register_link')}</Link>
                </p>
                <p style={{ marginTop: '10px', textAlign: 'center' }}>
                    <Link to="/dashboard">{t('guest_login_link')}</Link>
                </p>
            </motion.div>
        </motion.div>
    );
};

export default LoginPage;
