import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext'; // <-- Проверь путь
import { useTranslation } from 'react-i18next'; // Импортируем useTranslation

// Actions для проектов
import {
    clearProjects,
    fetchProjects,
    deleteProject,
    resetAddStatus,
    resetDeleteStatus
} from '../store/slices/projectsSlice';

// Компоненты и Стили
import CreateProjectForm from '../components/CreateProjectForm';
import '../styles/DashboardPage.css';

// Анимации
import { motion, AnimatePresence } from 'framer-motion';

const DashboardPage = () => {
    // Получаем функцию перевода
    const { t } = useTranslation();  // Получаем t() для перевода

    // --- Хуки ---
    const { user, logout } = useUser();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filterText, setFilterText] = useState('');

    // --- Селекторы Redux ---
    const projects = useSelector((state) => state.projects.items || []);
    const fetchStatus = useSelector((state) => state.projects.fetchStatus);
    const fetchError = useSelector((state) => state.projects.fetchError);
    const addStatus = useSelector((state) => state.projects.addStatus);
    const deleteStatus = useSelector((state) => state.projects.deleteStatus);
    const deleteError = useSelector((state) => state.projects.deleteError);
    const deletingProjectId = useSelector((state) => state.projects.deletingProjectId);

    // --- Эффекты ---
    useEffect(() => {
        if (fetchStatus === 'idle' || (user && projects.length > 0 && !projects.every(p => p.userId === user.uid)) || (!user && projects.length > 0 && projects.some(p => p.userId))) {
            if (fetchStatus !== 'loading') {
                dispatch(fetchProjects(user ? user.uid : null));
            }
        }
    }, [user, fetchStatus, dispatch]);

    useEffect(() => {
        if (addStatus === 'succeeded') {
            closeCreateModal();
        }
    }, [addStatus]);

    useEffect(() => {
        let timerId = null;
        if (deleteStatus === 'failed' || deleteStatus === 'succeeded') {
            timerId = setTimeout(() => { dispatch(resetDeleteStatus()); }, 3000);
        }
        return () => clearTimeout(timerId);
    }, [deleteStatus, dispatch]);

    // --- Обработчики ---
    const handleLogout = () => {
        logout();
        dispatch(clearProjects());
        navigate('/login');
    };

    const handleDeleteProject = (projectId) => {
        if (!window.confirm(t('DeleteProjectConfirmation', { projectId }))) return;
        if (user) {
            dispatch(deleteProject({ projectId, userId: user.uid }))
                .unwrap()
                .then(() => console.log(t('ProjectDeleted', { projectId })))
                .catch((err) => console.error(t('DeleteProjectError', { projectId, error: err })));
        }
    };

    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        if (addStatus !== 'idle') {
            dispatch(resetAddStatus());
        }
    };

    // --- Мемоизация Фильтрации и Рендеринга Списка ---
    const projectListContent = useMemo(() => {
        if (fetchStatus === 'loading') return <p>{t('LoadingProjects')}</p>;
        if (deleteStatus === 'failed') return <p>{t('DeleteError', { error: deleteError })}</p>;
        if (fetchStatus === 'failed') return <p>{t('FetchError', { error: fetchError })}</p>;

        const lowerCaseFilter = filterText.toLowerCase().trim();
        const filteredProjects = lowerCaseFilter
            ? projects.filter(project => project.name?.toLowerCase().includes(lowerCaseFilter))
            : projects;

        if (fetchStatus === 'succeeded' && filteredProjects.length === 0) {
            return filterText
                ? <p>{t('NoProjectsFound', { filterText })}</p>
                : <p>{t('NoProjects')}</p>;
        }

        if (fetchStatus === 'succeeded' && filteredProjects.length > 0) {
            return (
                <ul className="project-list">
                    <AnimatePresence>
                        {filteredProjects.map((project) => {
                            if (!project?.id) return null;
                            const isDeletingThisProject = deleteStatus === 'loading' && deletingProjectId === project.id;
                            return (
                                <motion.li
                                    key={project.id}
                                    className={`project-list-item ${isDeletingThisProject ? 'project-list-item--deleting' : ''}`}
                                    initial={{ opacity: 0, x: -50 }}  // Проект выдвигается слева
                                    animate={{ opacity: 1, x: 0 }}    // Плавное выдвижение
                                    exit={{ opacity: 0, x: 50 }}      // Сдвиг вправо при исчезновении
                                    transition={{ duration: 0.5 }}
                                >
                                    <Link to={`/project/${project.id}`}>{project.name}</Link>
                                    {user && (
                                        <button
                                            className="button button--delete"
                                            onClick={() => handleDeleteProject(project.id)}
                                            disabled={deleteStatus === 'loading'}
                                        >
                                            {isDeletingThisProject ? t('Deleting') : t('Delete')}
                                        </button>
                                    )}
                                </motion.li>
                            );
                        })}
                    </AnimatePresence>
                </ul>
            );
        }
        return null;
    }, [projects, filterText, fetchStatus, deleteStatus, deleteError, fetchError, deletingProjectId, user, dispatch, t]);

    // --- Основной Рендер Компонента ---
    return (
        <div className="dashboard-page">
            <h1>{t('Dashboard')}</h1>
            {user ? (
                <div className="user-greeting">
                    <p>{t('WelcomeUser', { email: user.email })}</p>
                    <button className="button" onClick={handleLogout}>{t('Logout')}</button>
                </div>
            ) : (
                <div className="guest-greeting">
                    <p>{t('WelcomeGuest')}</p>
                    <button className="button" onClick={() => navigate('/login')}>{t('Login')}</button>
                </div>
            )}

            <div className="projects-section">
                <h2>{t('Projects')}</h2>
                <div className="filter-container">
                    <label htmlFor="projectFilter">{t('Search')}</label>
                    <input
                        type="text"
                        id="projectFilter"
                        placeholder={t('ProjectNamePlaceholder')}
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="form-input"
                        disabled={fetchStatus === 'loading'}
                    />
                </div>
                {projectListContent}
            </div>

            {user && <button
                className="button button--create-project"
                onClick={openCreateModal}
                disabled={addStatus === 'loading' || deleteStatus === 'loading'}
            >
                {addStatus === 'loading' ? t('CreatingProject') : t('CreateProject')}
            </button>}

            {/* Модальное окно с анимацией */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        onClick={closeCreateModal}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <CreateProjectForm onCloseModal={closeCreateModal} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardPage;
