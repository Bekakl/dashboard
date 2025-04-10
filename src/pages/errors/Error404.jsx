import React from 'react';
import { useTranslation } from 'react-i18next';

const Error404 = () => {
    const { t } = useTranslation();

    return (
        <div className="error-page" style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f8d7da', color: '#721c24' }}>
            <h1 style={{ fontSize: '3em' }}>{t('error404_title')}</h1>
            <p style={{ fontSize: '1.5em' }}>{t('error404_message')}</p>
        </div>
    );
};

export default Error404;
