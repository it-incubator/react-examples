import React, {useCallback, useState} from "react";

const BoardHeader = React.memo(function() {
    console.log('BoardHeader')
    return <h1>
        My management
    </h1>;
})

const DropableAreaForDeleteTask = React.memo(function() {
    console.log("DropableAreaForDeleteTask")
    return <div style={{border: "solid 1px black", padding: '5px'}}>
        Drop here to delete
    </div>;
})

const Task = React.memo(function({ columnId, task, updateTaskStatus }) {
    console.log('Task ' + task.title)
    return <li>
        <input type={"checkbox"} onChange={(e) => {
            updateTaskStatus(columnId, task.id, e.currentTarget.checked)
        }} checked={task.isDone} /> {task.title}
    </li>;
})

const  Column = React.memo(function({id, title, tasks, updateTaskStatus}: any) {
      console.log("Column " + title)
    return <ul>
        {tasks.map(t => <Task task={t} key={t.id} updateTaskStatus={updateTaskStatus} columnId={id} />)}
    </ul>;
})

function Columns({columns, updateTaskStatus}: any) {
    console.log("Columns")
    return <div style={{display: "flex"}}>
        {columns.map(c => <Column id={c.id} title={c.title} key={c.id} tasks={c.tasks} updateTaskStatus={updateTaskStatus} />)}
    </div>;
}

export const Board = () => {

    const [columns, setColumns] = useState([
        {
            id: 1,
            title: 'todo',
            tasks:  [{ id: 1, isDone: true, title: 'js'}, { id: 2, isDone: true, title: 'css'}]
        },
        {
            id: 2,
            title: 'in-progress',
            tasks:  [{ id: 3, isDone: true, title: 'react'}, { id: 4, isDone: true, title: 'typescript'}]
        },
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

    console.log("Board")
    return <div>
        <BoardHeader />
        <DropableAreaForDeleteTask />
        <Columns columns={columns} updateTaskStatus={updateTaskStatus} />
    </div>
}