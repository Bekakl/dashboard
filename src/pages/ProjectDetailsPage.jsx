import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next'; // Подключаем useTranslation для перевода

// Actions
import { fetchProjects, updateGuestProject, resetUpdateStatus as resetProjectUpdateStatus } from '../store/slices/projectsSlice';
import { fetchTasks, deleteTask, deleteGuestTask, updateTask, updateGuestTask as updateGuestTaskStatus, resetTaskStatuses, clearTasks } from '../store/slices/tasksSlice';

// Компоненты
import AddTaskForm from '../components/AddTaskForm';
import EditProjectForm from '../components/EditProjectForm';
import KanbanBoard from '../components/KanbanBoard';
import ProjectHeader from '../components/ProjectHeader';

// Стили
import '../styles/Modal.css';

// Импортируем framer-motion
import { motion } from 'framer-motion';

const ProjectDetailsPage = () => {
    // --- Хуки ---
    const { id: projectId } = useParams();
    const dispatch = useDispatch();
    const { user } = useUser();
    const { t } = useTranslation(); // Используем хук для перевода

    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

    // --- Селекторы Redux ---
    const project = useSelector((state) => (state.projects.items || []).find(p => String(p.id) === String(projectId)));
    const projectFetchStatus = useSelector((state) => state.projects.fetchStatus);
    const projectFetchError = useSelector((state) => state.projects.fetchError);
    const projectUpdateStatus = useSelector((state) => state.projects.updateStatus);
    const projectUpdateError = useSelector((state) => state.projects.updateError);

    const tasksById = useSelector((state) => state.tasks.items);
    const tasksFetchStatus = useSelector((state) => state.tasks.fetchStatus);
    const tasksFetchError = useSelector((state) => state.tasks.fetchError);
    const taskAddStatus = useSelector((state) => state.tasks.addStatus);
    const taskUpdateStatus = useSelector((state) => state.tasks.updateStatus);
    const taskDeleteStatus = useSelector((state) => state.tasks.deleteStatus);
    const taskDeleteError = useSelector((state) => state.tasks.deleteError);
    const taskUpdateError = useSelector((state) => state.tasks.updateError);
    const processingTaskId = useSelector((state) => state.tasks.processingTaskId);

    // --- Эффекты ---
    useEffect(() => { if (projectFetchStatus === 'idle') dispatch(fetchProjects(user ? user.uid : null)); }, [projectFetchStatus, dispatch, user]);
    useEffect(() => { if (projectId && tasksFetchStatus === 'idle') dispatch(fetchTasks({ projectId, userId: user?.uid })); return () => { dispatch(clearTasks()); }; }, [projectId, user, dispatch]);
    // Сброс статусов задач
    useEffect(() => { let t; if (['succeeded', 'failed'].includes(taskAddStatus) || ['succeeded', 'failed'].includes(taskUpdateStatus) || ['succeeded', 'failed'].includes(taskDeleteStatus)) t = setTimeout(() => { dispatch(resetTaskStatuses()); }, 3000); return () => clearTimeout(t); }, [taskAddStatus, taskUpdateStatus, taskDeleteStatus, dispatch]);
    // Сброс статуса обновления проекта
    useEffect(() => { let t; if (['succeeded', 'failed'].includes(projectUpdateStatus)) t = setTimeout(() => { dispatch(resetProjectUpdateStatus()); }, 3000); return () => clearTimeout(t); }, [projectUpdateStatus, dispatch]);

    // --- Обработчики ---
    const handleDeleteTask = (taskId) => { if (!window.confirm(`${t('task.deleteConfirm')} ${taskId}?`)) return; if (user) dispatch(deleteTask({ taskId, userId: user.uid })).unwrap().catch(console.error); else dispatch(deleteGuestTask({ id: taskId })); };
    const handleTaskStatusChange = (taskId, newStatus) => { const changes = { status: newStatus }; if (user) dispatch(updateTask({ taskId, changes, userId: user.uid })).unwrap().catch(err => console.error("Update failed:", err)); else dispatch(updateGuestTaskStatus({ id: taskId, changes })); };
    const openAddTaskModal = () => setIsAddTaskModalOpen(true);
    const closeAddTaskModal = () => { setIsAddTaskModalOpen(false); if (taskAddStatus !== 'idle') dispatch(resetTaskStatuses()); };
    const openEditProjectModal = () => setIsEditProjectModalOpen(true);
    const closeEditProjectModal = () => { setIsEditProjectModalOpen(false); if (projectUpdateStatus !== 'idle') dispatch(resetProjectUpdateStatus()); };

    // --- Основной Рендер Компонента ---
    if (projectFetchStatus === 'loading') return <div className="loading-message">{t('loading.project')}</div>;
    if (projectFetchStatus === 'failed') return <div className="error-message">{`${t('error.loadingProject')}: ${String(projectFetchError)}`}</div>;
    if (projectFetchStatus === 'succeeded' && !project) return <div className="project-not-found"><h2>{t('projectNotFound')}</h2><p>{t('projectId')}: {projectId}</p><Link to="/dashboard">{t('back')}</Link></div>;

    // Проект найден
    if (projectFetchStatus === 'succeeded' && project) {
        const taskOperationError = tasksFetchError || taskDeleteError || taskUpdateError;

        return (
            <div className="project-details-page">
                {/* --- ИСПОЛЬЗУЕМ ProjectHeader --- */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <ProjectHeader
                        project={project}
                        user={user}
                        onEditClick={openEditProjectModal} // Передаем обработчик для кнопки Редактировать
                    />
                </motion.div>
                <hr />

                <h2>{t('project.tasks')}</h2>
                {/* Выводим ошибки операций с задачами */}
                {taskDeleteStatus === 'failed' && <p className="error-message">{`${t('task.deleteError')}: ${String(taskDeleteError)}`}</p>}
                {taskUpdateStatus === 'failed' && <p className="error-message">{`${t('task.updateError')}: ${String(taskUpdateError)}`}</p>}

                {/* --- ИСПОЛЬЗУЕМ KanbanBoard --- */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <KanbanBoard
                        tasksById={tasksById}
                        onTaskStatusChange={handleTaskStatusChange}
                        onDeleteTask={handleDeleteTask}
                        isLoading={tasksFetchStatus === 'loading'}
                        error={taskOperationError}
                        user={user}
                        processingTaskId={processingTaskId}
                        taskDeleteStatus={taskDeleteStatus}
                        taskUpdateStatus={taskUpdateStatus}
                    />
                </motion.div>

                {/* --- Кнопки и Модалки --- */}
                <div style={{marginTop: '20px'}}>
                    {user && <motion.button
                        className="button button--add-task"
                        onClick={openAddTaskModal}
                        disabled={taskAddStatus === 'loading' || taskDeleteStatus === 'loading' || taskUpdateStatus === 'loading'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {t('task.add')}
                    </motion.button>}
                </div>

                <div className="navigation-link" style={{marginTop: '20px'}}>
                    <Link to="/dashboard">{t('back')}</Link>
                </div>

                {/* Модальное окно добавления задачи */}
                {isAddTaskModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        onClick={closeAddTaskModal}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <AddTaskForm projectId={project?.id} onCloseModal={closeAddTaskModal} />
                        </motion.div>
                    </motion.div>
                )}

                {/* Модальное окно редактирования проекта */}
                {isEditProjectModalOpen && project && (
                    <motion.div
                        className="modal-overlay"
                        onClick={closeEditProjectModal}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <EditProjectForm
                                project={project}
                                user={user}
                                onCloseModal={closeEditProjectModal}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </div>
        );
    }

    return <div className="loading-message">{t('initializing')}</div>;
};

export default ProjectDetailsPage;
