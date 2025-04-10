// src/store.js
import { configureStore } from '@reduxjs/toolkit';

// Импортируем редьюсер для проектов
// Убедись, что путь './store/slices/projectsSlice' правильный для твоей структуры
// Если store.js лежит в src/, а слайсы в src/store/slices/, то путь верный.
// Если store.js лежит в src/, а слайсы в src/slices/, то путь должен быть './slices/projectsSlice'
import projectsReducer from './store/slices/projectsSlice';

// --- ШАГ 1: Импортируем редьюсер для задач ---
// Используй такой же стиль пути, как и для projectsReducer
import tasksReducer from './store/slices/tasksSlice';

// Создаем и конфигурируем store
const store = configureStore({
    // Корневой редьюсер, объединяющий редьюсеры всех слайсов
    reducer: {
        // Ключ 'projects' будет использоваться для доступа к состоянию проектов (state.projects)
        projects: projectsReducer,

        // --- ШАГ 2: Добавляем редьюсер задач ---
        // Ключ 'tasks' будет использоваться для доступа к состоянию задач (state.tasks)
        tasks: tasksReducer,

        // Сюда можно будет добавлять другие редьюсеры, если понадобятся
    },
    // Middleware и DevTools настраиваются автоматически по умолчанию
});

// Экспортируем сконфигурированный store
export default store;
