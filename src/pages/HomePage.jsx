import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Импортируем функцию t для локализации
import { motion } from 'framer-motion'; // Импортируем framer-motion
import '../styles/HomePage.css'; // Подключаем стили

// --- ИМПОРТИРУЕМ ИЗОБРАЖЕНИЯ ---
import step1Image from '../steps/img.png';
import step2Image from '../steps/img_1.png';
import step3Image from '../steps/img_2.png';
import step4Image from '../steps/img_3.png';
import step5Image from '../steps/img_4.png';
// ---

const HomePage = () => {
    const { t } = useTranslation(); // Получаем функцию перевода t()

    // --- Состояние для открытой картинки в модалке ---
    const [modalImageSrc, setModalImageSrc] = useState(null); // null - закрыто, строка_src - открыто

    const stepData = [
        { key: 'step1', text: t('InstructionStep1', '1. Войти/Зарегистрироваться.'), image: step1Image },
        { key: 'step2', text: t('InstructionStep2', '2. Создать проект.'), image: step2Image },
        { key: 'step3', text: t('InstructionStep3', '3. Добавить задачи.'), image: step3Image },
        { key: 'step4', text: t('InstructionStep4', '4. Перемещать задачи перетаскиванием.'), image: step4Image },
        { key: 'step5', text: t('InstructionStep5', '5. Удалять задачи.'), image: step5Image }
    ];

    // Функции открытия/закрытия модалки
    const openImageModal = (src) => setModalImageSrc(src);
    const closeImageModal = () => setModalImageSrc(null);

    return (
        <div className="home-page page-container">
            {/* Приветственный блок */}
            <motion.div
                className="welcome-box"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>{t('WelcomeTo', { appName: t('AppTitle', 'Project Dashboard') })}</h1>
                <p>{t('HomePageDescription', 'Простой и удобный инструмент для управления вашими проектами и задачами.')}</p>
                <Link to="/dashboard" className="button button--primary">{t('GetStarted', 'Начать работу')}</Link>
            </motion.div>

            {/* Блок инструкции */}
            <motion.div
                className="instructions-box"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h2>{t('HowToUse', 'Как пользоваться?')}</h2>
                <div className="steps-container">
                    {stepData.map((step, index) => (
                        <motion.div
                            key={step.key}
                            className="step-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        >
                            {/* --- Делаем плейсхолдер кликабельным --- */}
                            <div
                                className="step-image-placeholder step-image-placeholder--clickable"
                                onClick={() => openImageModal(step.image)}
                                title={t('ClickToZoom', 'Нажмите для увеличения')}
                            >
                                <img
                                    src={step.image}
                                    alt={step.text}
                                    className="step-image"
                                />
                            </div>
                            <p className="step-caption">{step.text}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Модальное окно для картинки */}
            {modalImageSrc && (
                <motion.div
                    className="modal-overlay"
                    onClick={closeImageModal}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="image-modal-content"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <button
                            className="modal-close-button"
                            onClick={closeImageModal}
                            title="Закрыть"
                        >
                            &#x2716; {/* Крестик */}
                        </button>
                        <img src={modalImageSrc} alt={t('InstructionStepFull', 'Шаг инструкции (увеличенно)')} />
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default HomePage;
