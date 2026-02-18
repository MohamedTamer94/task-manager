import TaskLists from "../components/TasksList";

function TasksPage() {
    return (
        <>
            <div className="flex flex-col justify-center items-center p-14">
                <h1 className="font-black text-gray-950 text-2xl mb-4">Task Manager</h1>
                <TaskLists/>
            </div>
        </>
    );
}

export default TasksPage;