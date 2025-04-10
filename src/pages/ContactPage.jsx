// src/pages/ContactPage.jsx
import React, { useState, useEffect } from 'react'; // Добавили useEffect
import { useTranslation } from 'react-i18next'; // или '../hooks/useTranslation'
import { useUser } from '../contexts/UserContext'; // <-- Импортируем useUser
import '../styles/AuthPage.css'; // Используем общие стили для формы
import '../styles/ContactPage.css'; // Подключаем стили для этой страницы
import { motion } from 'framer-motion'; // Импортируем framer-motion

const ContactPage = () => {
    const { t } = useTranslation();
    const { user } = useUser(); // <-- Получаем пользователя

    // Состояние для формы отчета об ошибке
    const [reporterName, setReporterName] = useState('');
    const [reporterEmail, setReporterEmail] = useState('');
    const [errorReport, setErrorReport] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Флаг отправки

    // Эффект для предзаполнения полей, если пользователь вошел
    useEffect(() => {
        if (user) {
            setReporterName(user.displayName || ''); // Берем displayName, если есть
            setReporterEmail(user.email || '');     // Берем email
        } else {
            // Сбрасываем поля, если пользователь вышел (на случай если он разлогинился на этой странице)
            setReporterName('');
            setReporterEmail('');
        }
    }, [user]); // Зависим от user

    // Обработчик отправки отчета об ошибке
    const handleErrorReportSubmit = (e) => {
        e.preventDefault();
        // Простая валидация
        if (!reporterName.trim() || !reporterEmail.trim() || !errorReport.trim()) {
            alert(t('FillAllFields', 'Пожалуйста, заполните все поля формы отчета об ошибке.'));
            return;
        }
        setIsSubmitting(true);
        console.log('Отправка отчета об ошибке:', {
            name: reporterName,
            email: reporterEmail,
            message: errorReport
        });
        // Имитация отправки
        setTimeout(() => {
            alert(t('ErrorReportSubmit', 'Спасибо! Ваше сообщение об ошибке "отправлено".'));
            setErrorReport(''); // Очищаем только текст сообщения
            if (!user) { // Очищаем имя и email, только если это был гость
                setReporterName('');
                setReporterEmail('');
            }
            setIsSubmitting(false);
        }, 500); // Небольшая задержка для имитации
    };

    // Номер для перевода (остается)
    const p2pNumber = '+7 707 123 45 67'; // <-- ЗАМЕНИ НА СВОЙ
    const paymentSystem = 'Kaspi';

    return (
        <motion.div
            className="contact-page page-container"
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
                {t('ContactUs', 'Свяжитесь с нами')}
            </motion.h1>

            {/* --- Основной Контейнер с Двумя Колонками --- */}
            <div className="contact-page__content">

                {/* --- Левая Колонка: Форма Отчета об Ошибке --- */}
                <motion.div
                    className="contact-page__column contact-page__column--left"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="auth-form-box"> {/* Используем тот же стиль бокса */}
                        <h2>{t('ReportErrorTitle', 'Сообщить об ошибке')}</h2>
                        <p>{t('ReportErrorInfo', 'Столкнулись с проблемой? Опишите ее как можно подробнее.')}</p>
                        <form onSubmit={handleErrorReportSubmit}>
                            {/* Поле Имя */}
                            <div className="form-field">
                                <label htmlFor="contactName">{t('YourName', 'Ваше Имя:')}</label>
                                <input
                                    type="text"
                                    id="contactName"
                                    name="name"
                                    value={reporterName}
                                    onChange={(e) => setReporterName(e.target.value)}
                                    required
                                    disabled={isSubmitting} // Блокируем при отправке
                                    className="form-input"
                                />
                            </div>
                            {/* Поле Email */}
                            <div className="form-field">
                                <label htmlFor="contactEmail">{t('YourEmail', 'Ваш Email:')}</label>
                                <input
                                    type="email"
                                    id="contactEmail"
                                    name="email"
                                    value={reporterEmail}
                                    onChange={(e) => setReporterEmail(e.target.value)}
                                    required
                                    // Делаем поле только для чтения, если пользователь авторизован
                                    readOnly={!!user}
                                    disabled={isSubmitting}
                                    className="form-input"
                                />
                            </div>
                            {/* Поле Описания Ошибки */}
                            <div className="form-field">
                                <label htmlFor="errorReport">{t('ErrorDescription', 'Описание ошибки:')}</label>
                                <textarea
                                    id="errorReport"
                                    name="errorReport" // Добавляем имя
                                    rows="5"
                                    value={errorReport}
                                    onChange={(e) => setErrorReport(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    className="form-input"
                                />
                            </div>
                            <button type="submit" className="button button--submit" disabled={isSubmitting}>
                                {isSubmitting ? t('Sending', 'Отправка...') : t('SendReport', 'Отправить отчет')}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* --- Правая Колонка: Поддержка Проекта --- */}
                <motion.div
                    className="contact-page__column contact-page__column--right"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="auth-form-box"> {/* Используем тот же стиль бокса */}
                        <h2>{t('SupportProjectTitle', 'Поддержать проект')}</h2>
                        <p>{t('SupportProjectInfo', 'Если вам нравится наш инструмент, вы можете поддержать его развитие переводом.')}</p>

                        {/* Flip Card (остается) */}
                        <div className="flip-card-container">
                            <div className="flip-card">
                                <div className="flip-card-inner">
                                    <div className="flip-card-front">
                                        <div className='flip-card-logo'>{paymentSystem}</div>
                                        <div className='flip-card-chip'></div>
                                        <div className='flip-card-hint'>{t('HoverToSeeNumber', 'Наведите, чтобы увидеть номер')}</div>
                                    </div>
                                    <div className="flip-card-back">
                                        <div className='flip-card-back-header'>{t('TransferByNumber', 'Перевод по номеру')} ({paymentSystem}):</div>
                                        <div className='flip-card-number'>{p2pNumber}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* --- */}

                        <p style={{ marginTop: '25px' }}>{t('SupportThanks', 'Спасибо за вашу поддержку!')}</p>
                        {/* Сюда позже добавишь свою информацию */}
                        <p style={{ marginTop: '15px', fontStyle: 'italic' }}>{t('SupportSpecificsPlaceholder', '(Здесь будет информация о способах поддержки)')}</p>
                    </div>
                </motion.div>

            </div> {/* --- Конец Контейнера с Колонками --- */}
        </motion.div>
    );
};

export default ContactPage;
