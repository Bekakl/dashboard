// src/store/slices/projectsSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../contexts/firebase'; // <-- ПРОВЕРЬ ПУТЬ

// --- Thunk: ПОЛУЧЕНИЕ списка проектов ---
export const fetchProjects = createAsyncThunk(
    'projects/fetchProjects',
    async (userId, { rejectWithValue }) => {
        // console.log(`[FETCH Prj] Thunk НАЧАЛО --- userId: ${userId}`);
        try {
            if (userId) {
                // console.log(`[FETCH Prj] Загрузка Firestore для userId: ${userId}`);
                const projectsRef = collection(db, 'projects');
                const q = query(projectsRef, where("userId", "==", userId));
                const querySnapshot = await getDocs(q);
                // Конвертация Timestamp
                const projects = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null;
                    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null;
                    return { id: doc.id, ...data, createdAt, updatedAt };
                });
                // console.log(`[FETCH Prj] Firestore УСПЕХ. Загружено: ${projects.length}`);
                return projects;
            } else {
                // console.log("[FETCH Prj] Загрузка JSON для гостя.");
                const response = await fetch('/data/projects.json'); // Файл в /public/data/
                if (!response.ok) throw new Error(`HTTP ошибка! Статус: ${response.status}`);
                const data = await response.json();
                // console.log(`[FETCH Prj] JSON УСПЕХ. Загружено: ${data.length}`);
                return data;
            }
        } catch (error) {
            console.error(`--- [FETCH Prj] Thunk ОШИБКА --- ${error.message}`, error);
            return rejectWithValue(error.message || 'Не удалось загрузить проекты');
        } finally {
            // console.log(`--- [FETCH Prj] Thunk ЗАВЕРШЕНИЕ --- userId: ${userId}`);
        }
    }
);

// --- Thunk: ДОБАВЛЕНИЕ проекта (для пользователя) ---
export const addProject = createAsyncThunk(
    'projects/addProject',
    async ({ projectData, userId }, { rejectWithValue }) => {
        // console.log(`--- [ADD Prj] Thunk НАЧАЛО --- userId: ${userId}`);
        if (!userId) return rejectWithValue('Пользователь не авторизован');
        try {
            const dataToSave = { ...projectData, userId: userId, createdAt: serverTimestamp() };
            // console.log('[ADD Prj] Данные для сохранения:', dataToSave);
            const docRef = await addDoc(collection(db, 'projects'), dataToSave);
            // console.log(`[ADD Prj] Проект добавлен, ID: ${docRef.id}`);
            const newProject = { id: docRef.id, ...projectData, userId: userId };
            return newProject;
        } catch (error) {
            console.error(`--- [ADD Prj] Thunk ОШИБКА --- ${error.message}`, error);
            return rejectWithValue(error.message || 'Не удалось создать проект');
        } finally {
            // console.log(`--- [ADD Prj] Thunk ЗАВЕРШЕНИЕ ---`);
        }
    }
);

// --- Thunk: ОБНОВЛЕНИЕ проекта (для пользователя) ---
export const updateFirestoreProject = createAsyncThunk(
    'projects/updateFirestoreProject',
    async ({ projectId, updatedData }, { rejectWithValue }) => {
        // console.log(`--- [UPDATE Prj] Thunk НАЧАЛО --- projectId: ${projectId}`);
        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, { ...updatedData, updatedAt: serverTimestamp() });
            // console.log(`[UPDATE Prj] Проект ${projectId} обновлен`);
            return { id: projectId, changes: updatedData };
        } catch (error) {
            console.error(`--- [UPDATE Prj] Thunk ОШИБКА --- ${error.message}`, error);
            return rejectWithValue(error.message || 'Не удалось обновить проект');
        } finally {
            // console.log(`--- [UPDATE Prj] Thunk ЗАВЕРШЕНИЕ ---`);
        }
    }
);

// --- Thunk: УДАЛЕНИЕ проекта (для пользователя) ---
export const deleteProject = createAsyncThunk(
    'projects/deleteProject',
    async ({ projectId, userId }, { rejectWithValue }) => {
        // console.log(`--- [DELETE Prj] Thunk НАЧАЛО --- projectId: ${projectId}`);
        if (!projectId) return rejectWithValue('Не указан ID проекта');
        try {
            // console.log(`[DELETE Prj] Удаляем проект ${projectId}...`);
            await deleteDoc(doc(db, 'projects', projectId));
            // console.log(`[DELETE Prj] Проект ${projectId} успешно удален.`);
            console.warn(`[DELETE Prj] Задачи для проекта ${projectId} НЕ УДАЛЕНЫ автоматически!`);
            return { id: projectId };
        } catch (error) {
            console.error(`--- [DELETE Prj] Thunk ОШИБКА --- ${error.message}`, error);
            return rejectWithValue(error.message || 'Не удалось удалить проект');
        } finally {
            // console.log(`--- [DELETE Prj] Thunk ЗАВЕРШЕНИЕ ---`);
        }
    }
);

// --- Начальное состояние ---
const initialState = {
    items: [], fetchStatus: 'idle', fetchError: null,
    addStatus: 'idle', addError: null,
    updateStatus: 'idle', updateError: null,
    deleteStatus: 'idle', deleteError: null,
    deletingProjectId: null,
};

const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    // --- Синхронные редьюсеры ---
    reducers: {
        clearProjects: (state) => { Object.assign(state, initialState); },
        updateGuestProject: (state, action) => {
            const { id, changes } = action.payload;
            const index = state.items.findIndex(p => String(p.id) === String(id));
            if (index !== -1) state.items[index] = { ...state.items[index], ...changes };
        },
        deleteGuestProject: (state, action) => {
            const { id } = action.payload;
            state.items = state.items.filter(project => String(project.id) !== String(id));
        },
        resetAddStatus: (state) => { state.addStatus = 'idle'; state.addError = null; },
        resetUpdateStatus: (state) => { state.updateStatus = 'idle'; state.updateError = null; },
        resetDeleteStatus: (state) => { state.deleteStatus = 'idle'; state.deleteError = null; state.deletingProjectId = null; }
    },
    // --- Обработка Thunks ---
    extraReducers: (builder) => {
        builder
            // fetchProjects
            .addCase(fetchProjects.pending, (state) => { state.fetchStatus = 'loading'; state.fetchError = null; })
            .addCase(fetchProjects.fulfilled, (state, action) => { state.fetchStatus = 'succeeded'; state.items = action.payload || []; })
            .addCase(fetchProjects.rejected, (state, action) => { state.fetchStatus = 'failed'; state.fetchError = action.payload; })
            // addProject
            .addCase(addProject.pending, (state) => { state.addStatus = 'loading'; state.addError = null; })
            .addCase(addProject.fulfilled, (state, action) => { state.addStatus = 'succeeded'; if (action.payload?.id) state.items.push(action.payload); })
            .addCase(addProject.rejected, (state, action) => { state.addStatus = 'failed'; state.addError = action.payload; })
            // updateFirestoreProject
            .addCase(updateFirestoreProject.pending, (state) => { state.updateStatus = 'loading'; state.updateError = null; })
            .addCase(updateFirestoreProject.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded';
                const { id, changes } = action.payload;
                const index = state.items.findIndex(p => String(p.id) === String(id));
                if (index !== -1) state.items[index] = { ...state.items[index], ...changes };
            })
            .addCase(updateFirestoreProject.rejected, (state, action) => { state.updateStatus = 'failed'; state.updateError = action.payload; })
            // deleteProject
            .addCase(deleteProject.pending, (state, action) => { state.deleteStatus = 'loading'; state.deleteError = null; state.deletingProjectId = action.meta.arg.projectId; })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.deleteStatus = 'succeeded'; state.deletingProjectId = null;
                const { id } = action.payload;
                if (id) state.items = state.items.filter(project => String(project.id) !== String(id));
            })
            .addCase(deleteProject.rejected, (state, action) => { state.deleteStatus = 'failed'; state.deleteError = action.payload; state.deletingProjectId = null; });
    },
});

export const { clearProjects, updateGuestProject, deleteGuestProject, resetAddStatus, resetUpdateStatus, resetDeleteStatus } = projectsSlice.actions;
export default projectsSlice.reducer;