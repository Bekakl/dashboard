// src/store/slices/tasksSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
    collection,
    getDocs,
    query,
    where,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
// --- ИСПРАВЬ ПУТЬ ПРИ НЕОБХОДИМОСТИ ---
import { db } from '../../contexts/firebase';

// --- Thunk: Получение задач ---
export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async ({ projectId, userId }, { rejectWithValue }) => {
        console.log(`[TASKS FETCH] Thunk НАЧАЛО --- projectId: ${projectId}, userId: ${userId}`);
        if (!projectId) return rejectWithValue('Не указан ID проекта');
        try {
            let tasks = [];
            if (userId) {
                console.log(`[TASKS FETCH] Загрузка Firestore для projectId: ${projectId}`);
                const tasksRef = collection(db, 'tasks');
                const q = query(tasksRef, where("projectId", "==", projectId)); // Ищем по projectId
                const querySnapshot = await getDocs(q);
                tasks = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    // Конвертация Timestamp
                    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null;
                    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null;
                    return { id: doc.id, ...data, createdAt, updatedAt };
                });
                console.log(`[TASKS FETCH] Firestore УСПЕХ. Загружено: ${tasks.length}`);
            } else {
                console.log("[TASKS FETCH] Загрузка JSON для гостя.");
                const response = await fetch('/data/tasks.json'); // Файл в /public/data/
                if (!response.ok) throw new Error(`HTTP ошибка! Статус: ${response.status}`);
                const allTasks = await response.json();
                tasks = allTasks.filter(task => String(task.projectId) === String(projectId)); // Фильтруем по projectId
                console.log(`[TASKS FETCH] JSON УСПЕХ. Найдено для ${projectId}: ${tasks.length}`);
            }
            return tasks; // Массив задач
        } catch (error) {
            console.error(`--- [TASKS FETCH] Thunk ОШИБКА --- ${error.message}`, error);
            return rejectWithValue(error.message || 'Не удалось загрузить задачи');
        } finally {
            console.log(`--- [TASKS FETCH] Thunk ЗАВЕРШЕНИЕ --- projectId: ${projectId}`);
        }
    }
);

// --- Thunk: Добавление Задачи (для пользователя) ---
export const addTask = createAsyncThunk(
    'tasks/addTask',
    async ({ taskData, projectId, userId }, { rejectWithValue }) => {
        console.log(`--- [TASK ADD] Thunk НАЧАЛО --- projectId: ${projectId}, userId: ${userId}`);
        if (!userId || !projectId) return rejectWithValue('Необходим userId и projectId');
        try {
            const dataToSave = {
                ...taskData, // title, description?, etc.
                status: taskData.status || 'todo', // Статус по умолчанию
                projectId: projectId,
                userId: userId,
                createdAt: serverTimestamp()
            };
            console.log('[TASK ADD] Данные для сохранения:', dataToSave);
            const docRef = await addDoc(collection(db, 'tasks'), dataToSave);
            console.log(`[TASK ADD] Задача добавлена, ID: ${docRef.id}`);
            // Возвращаем созданный объект
            const newTask = { id: docRef.id, ...dataToSave };
            delete newTask.createdAt; // Удаляем несериализуемое поле
            return newTask;
        } catch (error) {
            console.error(`--- [TASK ADD] Thunk ОШИБКА --- ${error.message}`, error);
            return rejectWithValue(error.message || 'Не удалось добавить задачу');
        } finally {
            console.log(`--- [TASK ADD] Thunk ЗАВЕРШЕНИЕ ---`);
        }
    }
);

// --- Thunk: Удаление Задачи (для пользователя) ---
export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async ({ taskId, userId }, { rejectWithValue }) => {
        console.log(`--- [TASK DELETE] Thunk НАЧАЛО --- taskId: ${taskId}`);
        if (!taskId) return rejectWithValue('Не указан ID задачи');
        // Проверь правила Firestore для удаления задач
        try {
            console.log(`[TASK DELETE] Удаляем задачу ${taskId}...`);
            await deleteDoc(doc(db, 'tasks', taskId));
            console.log(`[TASK DELETE] Задача ${taskId} удалена.`);
            return { id: taskId }; // Возвращаем ID для редьюсера
        } catch (error) {
            console.error(`--- [TASK DELETE] Thunk ОШИБКА --- ${error.message}`, error);
            return rejectWithValue(error.message || 'Не удалось удалить задачу');
        } finally {
            console.log(`--- [TASK DELETE] Thunk ЗАВЕРШЕНИЕ ---`);
        }
    }
);

// --- Thunk: Обновление Задачи (для пользователя) ---
export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async ({ taskId, changes, userId }, { rejectWithValue }) => {
        console.log(`--- [TASK UPDATE] Thunk НАЧАЛО --- taskId: ${taskId}, changes:`, changes);
        if (!taskId || !changes) return rejectWithValue('Необходим taskId и changes');
        // Проверь правила Firestore
        try {
            const taskRef = doc(db, 'tasks', taskId);
            const dataToUpdate = { ...changes, updatedAt: serverTimestamp() };
            await updateDoc(taskRef, dataToUpdate);
            console.log(`[TASK UPDATE] Задача ${taskId} обновлена.`);
            return { id: taskId, changes: changes };
        } catch (error) {
            console.error(`--- [TASK UPDATE] Thunk ОШИБКА --- ${error.message}`, error);
            return rejectWithValue(error.message || 'Не удалось обновить задачу');
        } finally {
            console.log(`--- [TASK UPDATE] Thunk ЗАВЕРШЕНИЕ ---`);
        }
    }
);

// --- Начальное состояние ---
const initialState = {
    items: {}, // { taskId: taskObject }
    fetchStatus: 'idle', fetchError: null,
    addStatus: 'idle', addError: null,
    updateStatus: 'idle', updateError: null,
    deleteStatus: 'idle', deleteError: null,
    processingTaskId: null, // ID задачи, которая обновляется/удаляется
};

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    // --- Синхронные редьюсеры ---
    reducers: {
        clearTasks: (state) => { Object.assign(state, initialState); },
        updateGuestTask: (state, action) => {
            const { id, changes } = action.payload;
            if (state.items[id]) state.items[id] = { ...state.items[id], ...changes };
        },
        deleteGuestTask: (state, action) => {
            const { id } = action.payload;
            if (state.items[id]) delete state.items[id];
        },
        resetTaskStatuses: (state) => {
            state.addStatus = 'idle'; state.addError = null;
            state.updateStatus = 'idle'; state.updateError = null;
            state.deleteStatus = 'idle'; state.deleteError = null;
            state.processingTaskId = null;
        }
    },
    // --- Обработка Thunks ---
    extraReducers: (builder) => {
        builder
            // fetchTasks
            .addCase(fetchTasks.pending, (state) => { state.fetchStatus = 'loading'; state.fetchError = null; state.items = {}; })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.fetchStatus = 'succeeded';
                state.items = {};
                if (Array.isArray(action.payload)) {
                    action.payload.forEach(task => { if (task?.id) state.items[task.id] = task; });
                }
                // console.log(`[Reducer] fetchTasks succeeded. Tasks count: ${Object.keys(state.items).length}`);
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.fetchStatus = 'failed';
                state.fetchError = action.payload || action.error?.message || 'Unknown fetch error';
                // console.error('[Reducer] fetchTasks.rejected. Ошибка:', state.fetchError);
                // console.log('[Reducer] fetchTasks.rejected. Весь action:', action);
            })
            // addTask
            .addCase(addTask.pending, (state) => { state.addStatus = 'loading'; state.addError = null; })
            .addCase(addTask.fulfilled, (state, action) => {
                state.addStatus = 'succeeded';
                const newTask = action.payload;
                // console.log('[Reducer] addTask.fulfilled ДО:', JSON.stringify(state.items));
                // console.log('[Reducer] addTask.fulfilled PAYLOAD:', newTask);
                if (newTask?.id) state.items[newTask.id] = newTask; // Добавляем или обновляем по ID
                // console.log('[Reducer] addTask.fulfilled ПОСЛЕ:', JSON.stringify(state.items));
            })
            .addCase(addTask.rejected, (state, action) => { state.addStatus = 'failed'; state.addError = action.payload; })
            // deleteTask
            .addCase(deleteTask.pending, (state, action) => { state.deleteStatus = 'loading'; state.deleteError = null; state.processingTaskId = action.meta.arg.taskId; })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.deleteStatus = 'succeeded'; state.processingTaskId = null;
                const { id } = action.payload;
                if (id && state.items[id]) delete state.items[id];
            })
            .addCase(deleteTask.rejected, (state, action) => { state.deleteStatus = 'failed'; state.deleteError = action.payload; state.processingTaskId = null; })
            // updateTask
            .addCase(updateTask.pending, (state, action) => { state.updateStatus = 'loading'; state.updateError = null; state.processingTaskId = action.meta.arg.taskId; })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded'; state.processingTaskId = null;
                const { id, changes } = action.payload;
                if (id && state.items[id]) { state.items[id] = { ...state.items[id], ...changes }; }
            })
            .addCase(updateTask.rejected, (state, action) => { state.updateStatus = 'failed'; state.updateError = action.payload; state.processingTaskId = null; });
    },
});

export const { clearTasks, updateGuestTask, deleteGuestTask, resetTaskStatuses } = tasksSlice.actions;
export default tasksSlice.reducer;