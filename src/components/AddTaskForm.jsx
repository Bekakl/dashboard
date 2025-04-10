// src/components/AddTaskForm.jsx
import React, { useReducer, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '../contexts/UserContext'; // <-- Проверь путь
import { addTask, resetTaskStatuses } from '../store/slices/tasksSlice';
import {t} from "i18next"; // <-- Проверь путь

// Начальное состояние для полей формы
const initialFormState = {
    title: '',
    // Если нужно описание, раскомментируй:
    // description: '',
};

// Функция-редьюсер для управления состоянием формы
function formReducer(state, action) {
    switch (action.type) {
        // Обрабатываем изменение любого поля
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        // Сбрасываем форму к начальным значениям
        case 'RESET_FORM':
            return initialFormState;
        default:
            // В случае неизвестного действия возвращаем текущее состояние
            return state;
        // Или можно выбросить ошибку: throw new Error(`Unknown action type: ${action.type}`);
    }
}

// Компонент формы принимает ID проекта и функцию закрытия модалки
const AddTaskForm = ({ projectId, onCloseModal }) => {
    // Инициализируем редьюсер формы
    const [formState, dispatchForm] = useReducer(formReducer, initialFormState);

    // Получаем dispatch для Redux и текущего пользователя
    const dispatch = useDispatch();
    const { user } = useUser();

    // Получаем статус и ошибку добавления задачи из Redux store
    const addStatus = useSelector((state) => state.tasks.addStatus);
    const addError = useSelector((state) => state.tasks.addError);

    // Обработчик для всех полей ввода
    const handleInputChange = (event) => {
        // Отправляем действие в редьюсер формы, чтобы обновить поле
        dispatchForm({
            type: 'SET_FIELD',
            field: event.target.name, // Имя поля (атрибут name инпута)
            value: event.target.value, // Новое значение
        });
    };

    // Обработчик отправки формы
    const handleSubmit = async (event) => {
        event.preventDefault(); // Предотвращаем перезагрузку страницы

        // Простая валидация
        if (!formState.title.trim()) {
            alert("Название задачи не может быть пустым.");
            return;
        }
        if (!user || !projectId) {
            console.error("Не найден пользователь или ID проекта для добавления задачи.");
            // Здесь можно показать ошибку пользователю более явно
            alert("Произошла ошибка. Не удалось определить пользователя или проект.");
            return;
        }

        // Формируем данные для новой задачи
        const taskData = {
            title: formState.title,
            // description: formState.description, // Если есть поле описания
            status: 'todo', // Новая задача всегда начинается со статуса 'todo'
        };

        try {
            console.log("[AddTaskForm] Отправка addTask:", { taskData, projectId, userId: user.uid });
            // Отправляем асинхронный Thunk в Redux
            await dispatch(addTask({ taskData, projectId, userId: user.uid })).unwrap();

            // Если Thunk завершился успешно (fulfilled):
            console.log("[AddTaskForm] Задача успешно добавлена (Thunk fulfilled).");
            dispatchForm({ type: 'RESET_FORM' }); // Очищаем поля формы
            // Закрытие модалки произойдет в ProjectDetailsPage через useEffect,
            // который следит за addStatus === 'succeeded'

        } catch (rejectedValue) {
            // Если Thunk был отклонен (rejected):
            console.error("[AddTaskForm] Ошибка при добавлении задачи (Thunk rejected):", rejectedValue);
            // Ошибка уже должна быть в переменной addError из Redux,
            // и она отобразится в JSX ниже.
        }
    };

    // Эффект для сброса статуса ошибки Redux при размонтировании формы
    // (если пользователь закроет форму с ошибкой)
    useEffect(() => {
        return () => {
            if (addStatus === 'failed') {
                dispatch(resetTaskStatuses());
            }
        };
    }, [dispatch, addStatus]);

    // JSX разметка формы
    return (
        <form onSubmit={handleSubmit} className="add-task-form">
            <h3>{t('add_task_title')}</h3> {/* Заголовок формы */}

            {/* Отображение ошибки из Redux, если она есть */}
            {addStatus === 'failed' && (
                <p className="error-message" style={{ color: 'red' }}>
                    {t('add_task_error')}: {String(addError)} {/* Перевод ошибки */}
                </p>
            )}

            <div className="form-field">
                <label htmlFor="taskTitle">{t('task_title_label')}</label> {/* Перевод для label */}
                <input
                    type="text"
                    id="taskTitle"
                    name="title"
                    value={formState.title}
                    onChange={handleInputChange}
                    required
                    disabled={addStatus === 'loading'}
                />
            </div>

            {/* Если нужно поле описания */}
            {/* <div className="form-field">
            <label htmlFor="taskDescription">{t('task_description_label')}</label>
            <textarea
                id="taskDescription"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                disabled={addStatus === 'loading'}
            />
        </div> */}

            <div className="form-actions" style={{ marginTop: '15px' }}>
                <button
                    type="submit"
                    className="button button--submit"
                    disabled={addStatus === 'loading'}
                >
                    {addStatus === 'loading' ? t('add_task_adding') : t('add_task_add_button')}
                </button>
                <button
                    type="button"
                    className="button button--cancel"
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

export default AddTaskForm;