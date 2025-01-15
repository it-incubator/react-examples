import React, {useCallback, useState} from "react";
import {DndContext, KeyboardSensor, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors} from "@dnd-kit/core";

const borderWithPadding = {'border': '1px solid black', padding: '4px'};

const BoardHeader = React.memo(function () {
    console.log('BoardHeader')
    return <h1>
        My management
    </h1>;
})

const DropableAreaForDeleteTask = React.memo(function () {
    console.log("DropableAreaForDeleteTask")

    const {isOver, setNodeRef} = useDroppable({
        id: 'droppableDeleteTask',
    });

    return <div style={{marginBottom: '10px'}}>
        <AreaForDeleteTask isOver={isOver} setNodeRef={setNodeRef}/>
    </div>
})

const AreaForDeleteTask = React.memo(function ({isOver, setNodeRef}) {
    console.log("AreaForDeleteTask")

    const style = {
        color: isOver ? 'green' : undefined,
    };

    return <div ref={setNodeRef} style={{
        ...borderWithPadding,
        ...style
    }}>
        Drop here to delete
    </div>;
})

const DraggableTask = (props) => {

    const [draggableDisabled, setDraggableDisabled] = useState(false);

    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        disabled: draggableDisabled,
        id: 'task_' + props.task.id,
        data: {
            columnId: props.columnId,
            taskId: props.task.id,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
        <Task {...props} onModeChange={(mode) => {
            setDraggableDisabled(mode === 'edit');
        }} />
    </div>
}

const Task = React.memo(function ({columnId, task, updateTaskStatus, onModeChange}) {
    console.log('Task ' + task.title)
    const [mode, setMode] = useState('view')

    const changeMode = (mode) => {
        setMode(mode)
        onModeChange(mode)
    }

    return <div style={borderWithPadding}>
        <input type={"checkbox"} onChange={(e) => {
            updateTaskStatus(columnId, task.id, e.currentTarget.checked)
        }} checked={task.isDone}/>
        {mode === 'view' ? <span onDoubleClick={()=>changeMode('edit')}>{task.title}</span>
            : <input onDoubleClick={()=>changeMode('view')} defaultValue={task.title} />}
    </div>;
})


const DroppableColumn = (props: any) => {
    console.log("DroppableColumn " + props.title)
    const {isOver, setNodeRef} = useDroppable({
        id: 'droppableColumn_' + props.id,
        data: {
            columnId: props.id
        }
    });
    return <Column {...props} setNodeRef={setNodeRef}/>

}

const Column = React.memo(function ({id, title, tasks, updateTaskStatus, setNodeRef}: any) {
    console.log("Column " + title)
    return <div style={borderWithPadding} ref={setNodeRef}>
        {tasks.map(t => <DraggableTask task={t} key={t.id} updateTaskStatus={updateTaskStatus} columnId={id}/>)}
    </div>;
})

function Columns({columns, updateTaskStatus}: any) {
    console.log("Columns")
    return <div style={{display: "flex", gap: "50px"}}>
        {columns.map(c => <DroppableColumn id={c.id} title={c.title} key={c.id} tasks={c.tasks}
                                  updateTaskStatus={updateTaskStatus}/>)}
    </div>;
}

export const Board = () => {
    const [columns, setColumns] = useState([
        {
            id: 1,
            title: 'todo',
            tasks: [{id: 1, isDone: true, title: 'js'}, {id: 2, isDone: true, title: 'css'}]
        },
        {
            id: 2,
            title: 'in-progress',
            tasks: [{id: 3, isDone: true, title: 'react'}, {id: 4, isDone: true, title: 'typescript'}]
        },
        {
            id: 3,
            title: 'done',
            tasks: [{id: 5, isDone: true, title: 'nodejs'}]
        }
    ])

    const updateTaskStatus = useCallback((columnId: number, taskId: number, isDone: boolean) => {
        setColumns((actualColumns) => {
            const newState = actualColumns.map(c => c.id !== columnId ? c : {
                ...c,
                tasks: c.tasks.map(t => t.id !== taskId ? t : {...t, isDone: isDone})
            })
            return newState
        })
    }, [])

    const deleteTask = (columnId, taskId) => {
        setColumns((actualColumns) => {
            const newState = actualColumns.map(c => c.id !== columnId ? c : {
                ...c,
                tasks: c.tasks.filter(t => t.id !== taskId)
            })
            return newState
        })
    }

    const moveTaskToColumn = (fromColumnId, toColumnId, taskId) => {
        if (fromColumnId === toColumnId) return;

        setColumns((actualColumns) => {

            const fromColumn = actualColumns.find(c => c.id === fromColumnId)
            const taskToMove = fromColumn.tasks.find(t => t.id === taskId)

            const newState = actualColumns.map(c => {
               if (c.id !== fromColumnId && c.id !== toColumnId) return c;
               if (c.id === fromColumnId) {
                    return {
                        ...c,
                        tasks: c.tasks.filter(t => t.id !== taskId)
                    }
                }
                if (c.id === toColumnId) {
                    return {
                        ...c,
                        tasks: [...c.tasks, taskToMove]
                    }
                }
            })
            return newState
        })
    }

    console.log("Board")

    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            delay: 200,
            distance: 10,
            tolerance: 0
        }
    });
    const touchSensor = useSensor(TouchSensor, {});
    const keyboardSensor = useSensor(KeyboardSensor);

    const sensors = useSensors(
        mouseSensor,
        touchSensor,
        keyboardSensor,
    );

    return <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <div>
            <BoardHeader/>
            <DropableAreaForDeleteTask/>
            <Columns columns={columns} updateTaskStatus={updateTaskStatus}/>
        </div>
    </DndContext>

    function handleDragEnd(event) {
        console.log("handleDragEnd");
        // jперделлили, что мы перетащили туда, где должно удалиться таска
        if (event.over && event.over.id === 'droppableDeleteTask') {
            deleteTask(event.active.data.current.columnId, event.active.data.current.taskId);
        }

        if (event.over && event.over.id.startsWith('droppableColumn_')) {
            moveTaskToColumn(event.active.data.current.columnId, event.over.data.current.columnId, event.active.data.current.taskId);
        }
    }
}