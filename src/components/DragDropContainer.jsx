// src/components/DragDropContainer.jsx
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';

const DragDropContainer = ({ tasks }) => {
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(tasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Здесь можно добавить логику для сохранения изменений
        console.log('Перемещено:', reorderedItem);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="task-list">
                {(provided) => (
                    <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="task-list"
                    >
                        {tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided) => (
                                    <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="task-item"
                                    >
                                        {task.title}
                                    </li>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </ul>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default DragDropContainer;