// src/components/CreateProjectForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '../contexts/UserContext';
import { addProject, resetAddStatus } from '../store/slices/projectsSlice';
import { t } from "i18next";

const CreateProjectForm = ({ onCloseModal }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [localError, setLocalError] = useState(''); // Локальная ошибка валидации/отправки

    const dispatch = useDispatch();
    const { user } = useUser();

    // Статус и ошибка из Redux
    const addStatus = useSelector((state) => state.projects.addStatus);
    const addError = useSelector((state) => state.projects.addError);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLocalError(''); // Сброс локальной ошибки
        if (!name.trim()) {
            setLocalError(t('error_project_name_empty'));
            return;
        }
        if (!user) {
            setLocalError(t('error_user_not_authenticated'));
            return;
        }

        try {
            await dispatch(addProject({
                projectData: { name, description },
                userId: user.uid
            })).unwrap(); // Вызовет catch, если thunk отклонен

            // Успех - очистка и закрытие (закрытие произойдет через useEffect в DashboardPage)
            // setName('');
            // setDescription('');
            // onCloseModal(); // Не вызываем здесь, полагаемся на useEffect в DashboardPage

        } catch (rejectedValue) {
            // Ошибка из rejectWithValue
            console.error("Ошибка создания проекта (поймана в форме):", rejectedValue);
            setLocalError(String(rejectedValue) || t('error_create_project_failed'));
        }
    };

    // Сброс ошибки Redux при размонтировании, если она была
    useEffect(() => {
        return () => {
            if (addStatus === 'failed') {
                dispatch(resetAddStatus());
            }
        };
    }, [dispatch, addStatus]);

    return (
        <form onSubmit={handleSubmit}>
            <h2>{t('create_project_title')}</h2> {/* Заголовок формы */}

            {/* Отображение ошибок из локальной или глобальной переменной */}
            {(localError || addError) && (
                <p style={{ color: 'red' }}>{localError || String(addError)}</p>
            )}

            <div>
                <label htmlFor="projectName">{t('project_name_label')}</label>
                <input
                    id="projectName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={addStatus === 'loading'}
                />
            </div>
            <div>
                <label htmlFor="projectDescription">{t('project_description_label')}</label>
                <textarea
                    id="projectDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={addStatus === 'loading'}
                />
            </div>
            <div style={{ marginTop: '15px' }}>
                <button type="submit" disabled={addStatus === 'loading'}>
                    {addStatus === 'loading' ? t('create_project_creating') : t('create_project_create_button')}
                </button>
                <button
                    type="button"
                    onClick={onCloseModal}
                    disabled={addStatus === 'loading'}
                    style={{ marginLeft: '10px' }}
                >
                    {t('cancel_button')}
                </button>
            </div>
        </form>
    );
};

export default CreateProjectForm;
