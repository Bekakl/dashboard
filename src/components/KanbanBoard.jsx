// src/components/KanbanBoard.jsx
import React, { useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DroppableColumn from "./DroppableColumn";
import { useTranslation } from 'react-i18next'; // Импортируем хук для перевода

// --- TaskCard Component ---
const TaskCard = ({ task, isProcessing, onDelete, user }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    // Оставляем ТОЛЬКО стили, нужные для D&D, остальное уносим в CSS
    const dndStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging || isProcessing ? 0.5 : 1, // Оставим прозрачность при перетаскивании/обработке
        cursor: 'grab',
        touchAction: 'none',
    };

    // Собираем классы: базовый + модификаторы
    const cardClassName = `task-card ${isDragging ? 'task-card--dragging' : ''} ${isProcessing ? 'task-card--processing' : ''}`;

    return (
        <div ref={setNodeRef} style={dndStyle} className={cardClassName} {...attributes} {...listeners}>
            <span className="task-card__title">{task.title}</span>
            <div className="task-card__button-spacer">
                {(user || !user) && (
                    <button
                        className={`task-card__delete-button ${user ? 'button--delete-user' : 'button--delete-guest'}`}
                        onClick={() => onDelete(task.id)}
                        disabled={isProcessing}
                        title="Удалить задачу"
                    >
                        &#x2716;
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Статусы и Заголовки ---
const statuses = ['todo', 'inprogress', 'done'];

// --- KanbanBoard Component ---
const KanbanBoard = ({
                         tasksById, onTaskStatusChange, onDeleteTask, isLoading, error, user, processingTaskId, taskUpdateStatus, taskDeleteStatus
                     }) => {
    const { t } = useTranslation(); // Используем хук для перевода

    // --- Сенсоры D&D ---
    const sensors = useSensors( useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, }) );

    // --- Мемоизация данных ---
    const taskListArray = useMemo(() => Object.values(tasksById || {}), [tasksById]);
    const tasksByStatus = useMemo(() => statuses.reduce((acc, status) => {
        acc[status] = taskListArray.filter(task => (task.status || 'todo') === status);
        return acc;
    }, {}), [taskListArray]);

    // --- Обработчик handleDragEnd ---
    const handleDragEnd = (event) => {
        const { active, over } = event;

        // Логируем для проверки
        console.log("[KanbanBoard DragEnd] Active:", active);
        console.log("[KanbanBoard DragEnd] Over:", over);

        // Если бросили мимо любой колонки
        if (!over) {
            console.log("[KanbanBoard DragEnd] Invalid drop (over is null)");
            return;
        }

        const taskId = String(active.id); // ID Задачи
        const task = tasksById[taskId];   // Сама задача
        const sourceColumnId = task?.status || 'todo'; // Исходный статус

        // Определение целевой колонки
        const targetColumnId = statuses.includes(String(over.id))
            ? String(over.id)
            : null; // null, если бросили куда-то не туда

        // Обновляем, только если колонки РАЗНЫЕ и целевая валидна
        if (targetColumnId && sourceColumnId !== targetColumnId) {
            console.log(`[KanbanBoard DragEnd] Calling onTaskStatusChange(${taskId}, ${targetColumnId})`);
            onTaskStatusChange(taskId, targetColumnId); // Вызываем колбэк
        } else {
            console.log(`[KanbanBoard DragEnd] Dropped in the same column or invalid target (Target: ${targetColumnId}).`);
        }
    };

    // Рендеринг компонента
    if (isLoading) return <p className="loading-message">{t('loading_tasks')}</p>;
    if (error) return <p className="error-message">{t('error_message', { error: String(error) })}</p>;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="kanban-board">
                {statuses.map(statusId => {
                    const tasksInCurrentColumn = tasksByStatus[statusId] || [];
                    const taskIdsInColumn = tasksInCurrentColumn.map(t => t.id);

                    return (
                        <DroppableColumn key={statusId} id={statusId}>
                            <SortableContext
                                items={taskIdsInColumn}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="kanban-column">
                                    <h3>{t(`status.${statusId}`)}</h3> {/* Перевод названия статуса */}
                                    {tasksInCurrentColumn.length === 0 && (
                                        <p className="kanban-column__empty-message">{t('kanban_empty', {defaultValue: '(Empty)'})}</p>
                                    )}
                                    {tasksInCurrentColumn.map(task => {
                                        const isProcessing = processingTaskId === task.id &&
                                            (taskDeleteStatus === 'loading' || taskUpdateStatus === 'loading');

                                        return (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                isProcessing={isProcessing}
                                                onDelete={onDeleteTask}
                                                user={user}
                                            />
                                        );
                                    })}
                                </div>
                            </SortableContext>
                        </DroppableColumn>
                    );
                })}
            </div>
        </DndContext>
    );
};

export default KanbanBoard;
