import React from 'react';
import { useTranslation } from 'react-i18next';

// Принимает объект проекта, пользователя и колбэк для кнопки редактирования
const ProjectHeader = ({ project, user, onEditClick }) => {
    // Вызов useTranslation должен быть вне условий
    const { t } = useTranslation();

    // Если проект еще не загружен
    if (!project) return null;

    // Определяем, является ли текущий пользователь владельцем
    const isOwner = user && project.userId && project.userId === user.uid;

    return (
        <div className="project-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <h1>{project.name}</h1>
                {/* Кнопка редактирования для Владельца */}
                {isOwner && (
                    <button
                        className="button button--edit button--inline"
                        onClick={onEditClick} // Вызываем колбэк из пропсов
                        title={t('edit_project_button_title')} // Перевод кнопки редактирования
                    >
                        ✏️
                    </button>
                )}
                {/* Кнопка редактирования для Гостя */}
                {!user && (
                    <button
                        className="button button--edit-guest button--inline"
                        onClick={onEditClick} // Вызываем тот же колбэк
                    >
                        {t('edit_project_button_guest')} {/* Перевод для Гостя */}
                    </button>
                )}
            </div>
            <p className="project-description">{project.description || t('no_description')}</p> {/* Перевод для описания */}
            {/* Даты создания/обновления */}
            {project.createdAt && (
                <p className="meta-info">
                    <small>{t('created_at')}: {new Date(project.createdAt).toLocaleString()}</small>
                </p>
            )}
            {project.updatedAt && (
                <p className="meta-info">
                    <small>{t('updated_at')}: {new Date(project.updatedAt).toLocaleString()}</small>
                </p>
            )}
        </div>
    );
};

export default ProjectHeader;
