import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const DroppableColumn = ({ id, children }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    // Добавляем класс для отслеживания наведения на колонку
    const columnClass = isOver ? 'kanban-column droppable-over' : 'kanban-column';

    return (
        <div ref={setNodeRef} className={columnClass}>
            {children} {/* Дочерние элементы (задачи и заголовки) */}
        </div>
    );
};

export default DroppableColumn;
