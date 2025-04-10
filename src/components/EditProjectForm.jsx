// src/components/EditProjectForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// Импортируем actions для обоих случаев
import {
    updateGuestProject,         // Синхронный для гостя
    updateFirestoreProject,     // Асинхронный Thunk для пользователя
    resetUpdateStatus          // Для сброса статуса/ошибки обновления
} from '../store/slices/projectsSlice';
import { t } from 'i18next'; // <-- Проверь путь!

// Компонент принимает текущий проект, пользователя (user) и функцию закрытия модалки
const EditProjectForm = ({ project, user, onCloseModal }) => {
    // Состояние полей формы
    const [name, setName] = useState(project.name || '');
    const [description, setDescription] = useState(project.description || '');
    const [localError, setLocalError] = useState('');

    const dispatch = useDispatch();

    // Получаем статус и ошибку ОБНОВЛЕНИЯ проекта из Redux
    const updateStatus = useSelector((state) => state.projects.updateStatus);
    const updateError = useSelector((state) => state.projects.updateError);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLocalError('');
        if (!name.trim()) {
            setLocalError(t('error_project_name_empty'));
            return;
        }

        // Данные для обновления
        const changes = {
            name: name,
            description: description,
        };

        // Определяем, какое действие вызывать
        if (user) {
            // --- ЛОГИКА ДЛЯ ПОЛЬЗОВАТЕЛЯ ---
            try {
                // Диспатчим Thunk для обновления в Firestore
                await dispatch(updateFirestoreProject({
                    projectId: project.id,
                    updatedData: changes
                })).unwrap(); // unwrap() для отлова ошибки из rejectWithValue

                // Успех! Закрываем модалку
                onCloseModal();
            } catch (rejectedValue) {
                console.error("Ошибка обновления проекта (Firestore):", rejectedValue);
                setLocalError(t('error_update_project_failed'));
            }

        } else {
            // --- ЛОГИКА ДЛЯ ГОСТЯ ---
            dispatch(updateGuestProject({ id: project.id, changes: changes }));
            onCloseModal(); // Закрываем сразу, т.к. action синхронный
        }
    };

    // Сброс статуса ошибки Redux при размонтировании
    useEffect(() => {
        return () => {
            if (updateStatus === 'failed') {
                dispatch(resetUpdateStatus());
            }
        };
    }, [dispatch, updateStatus]);

    return (
        <form onSubmit={handleSubmit} className="edit-project-form">
            <h2>{t('edit_project_title')}</h2>

            {/* Показываем локальную ошибку ИЛИ ошибку из Redux */}
            {(localError || updateError) && (
                <p className="error-message" style={{ color: 'red' }}>
                    {localError || String(updateError)}
                </p>
            )}

            <div className="form-field">
                <label htmlFor="editProjectName">{t('project_name_label')}</label>
                <input
                    id="editProjectName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={updateStatus === 'loading'}
                />
            </div>
            <div className="form-field">
                <label htmlFor="editProjectDescription">{t('project_description_label')}</label>
                <textarea
                    id="editProjectDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={updateStatus === 'loading'}
                />
            </div>
            <div className="form-actions" style={{ marginTop: '15px' }}>
                <button type="submit" className="button button--submit" disabled={updateStatus === 'loading'}>
                    {updateStatus === 'loading' ? t('saving_button_text') : t('save_button_text')}
                </button>
                <button
                    type="button"
                    className="button button--cancel"
                    onClick={onCloseModal}
                    disabled={updateStatus === 'loading'}
                    style={{ marginLeft: '10px' }}
                >
                    {t('cancel_button_text')}
                </button>
            </div>
        </form>
    );
};

export default EditProjectForm;
