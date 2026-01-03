import { useState, useEffect } from "react";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { toast } from 'sonner';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import MainContainer from "@/Components/DivContainer/MainContainer";
import TaskTable from '@/Components/Table/TaskTable';
import Sidebar from "@/Components/Sidebar";


export default function Task() {
    // Header Title
    const HEADER_CONTENT = (
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                Tasks
            </h2>
        </div>
    )

    // Props
    const { props } = usePage();
    const {
        taskAll = [],
        notStarted = [],
        inProgress = [],
        completed = [],
        employees_data = [],
        divisions_data = [],
    } = props;


    // Sidebar
    const [open, setOpen] = useState(false);
    const [viewedTask, setViewedTask] = useState(null);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        }
    }, [open]);

    // Sync viewedTask with updated task data from props
    useEffect(() => {
        if (viewedTask?.id) {
            // Find the updated task in any of the task arrays
            const allTasks = [
                ...taskAll.data,
                ...notStarted.data,
                ...inProgress.data,
                ...completed.data,
            ];
            const updatedTask = allTasks.find(t => t.id === viewedTask.id);
            if (updatedTask && JSON.stringify(updatedTask) !== JSON.stringify(viewedTask)) {
                setViewedTask(updatedTask);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskAll.data, notStarted.data, inProgress.data, completed.data]);
    
    const handleRowClick = (task) => {
        setOpen(true);
        setViewedTask(task);
    }

    // Add Task
    const {
        data: addData,
        setData: setDataAdd,
        post: postAddData,
        processing: addProcessing,
        reset: resetAddData,
        errors: addErrors
    } = useForm({
        task_name: '',
        assignee: '',
        division: '',
        last_action: '',
        status: '',
        priority: '',
        due_date: null
    })

    // Edit Task

    // Task All
    const {
        data: editDataTaskAll,
        setData: setEditDataTaskAll,
        patch: postEditDataTaskAll,
        processing: editProcessingTaskAll,
        reset: resetEditDataTaskAll,
        errors: editErrorsTaskAll
    } = useForm({
        task_name: '',
        assignee: '',
        division: '',
        last_action: '',
        status: '',
        priority: '',
        due_date: ''
    })

    // Not Started
    const {
        data: editDataNotStarted,
        setData: setEditDataNotStarted,
        patch: postEditDataNotStarted,
        processing: editProcessingNotStarted,
        reset: resetEditDataNotStarted,
        errors: editErrorsNotStarted
    } = useForm({
        task_name: '',
        assignee: '',
        division: '',
        last_action: '',
        status: '',
        priority: '',
        due_date: ''
    })

    // In Progress
    const {
        data: editDataInProgress,
        setData: setEditDataInProgress,
        patch: postEditDataInProgress,
        processing: editProcessingInProgress,
        reset: resetEditDataInProgress,
        errors: editErrorsInProgress
    } = useForm({
        task_name: '',
        assignee: '',
        division: '',
        last_action: '',
        status: '',
        priority: '',
        due_date: ''
    })

    // Completed
    const {
        data: editDataCompleted,
        setData: setEditDataCompleted,
        patch: postEditDataCompleted,
        processing: editProcessingCompleted,
        reset: resetEditDataCompleted,
        errors: editErrorsCompleted
    } = useForm({
        task_name: '',
        assignee: '',
        division: '',
        last_action: '',
        status: '',
        priority: '',
        due_date: ''
    })

    // Delete Task
    const deleteTask = (taskId) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        toast.loading("Deleting task...");

        router.delete(route("task.destroy", taskId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.dismiss();
                toast.success("Task deleted!");
            },
            onError: (errors) => {
                const messages = Object.values(errors).flat().join(" ");
                toast.dismiss();
                toast.error(messages || "Something went wrong.");
            },
        });
    };


    return (
        <AuthenticatedLayout
            header={HEADER_CONTENT}
        >
            <Head title="Tasks" />

            <MainContainer>
                <Sidebar
                    open={open}
                    task={viewedTask}
                    onClose={() => setOpen(false)}
                />

                <div className="flex flex-col gap-8">
                    <TaskTable
                        borderColor="border-violet-600"
                        tableTitle="All Tasks"
                        tableIcon="📄"
                        data={taskAll.data}
                        employees_data={employees_data}
                        divisions_data={divisions_data}
                        paginationLinks={taskAll.links}
                        paginationCurrentPage={taskAll.current_page}
                        paginationPerPage={taskAll.per_page}
                        paginationTotal={taskAll.total}
                        paginationLastPage={taskAll.last_page}
                        addData={addData}
                        setDataAdd={setDataAdd}
                        postAddData={postAddData}
                        addProcessing={addProcessing}
                        resetAddData={resetAddData}
                        addErrors={addErrors}
                        editData={editDataTaskAll}
                        setEditData={setEditDataTaskAll}
                        postEditData={postEditDataTaskAll}
                        editProcessing={editProcessingTaskAll}
                        resetEditData={resetEditDataTaskAll}
                        editErrors={editErrorsTaskAll}
                        deleteTask={deleteTask}
                        onRowClick={handleRowClick}
                        tableType="task_all"
                    />

                    <TaskTable
                        borderColor="border-gray-600"
                        tableTitle="Not Started"
                        tableIcon="❌"
                        data={notStarted.data}
                        employees_data={employees_data}
                        divisions_data={divisions_data}
                        paginationLinks={notStarted.links}
                        paginationCurrentPage={notStarted.current_page}
                        paginationPerPage={notStarted.per_page}
                        paginationTotal={notStarted.total}
                        paginationLastPage={notStarted.last_page}
                        addData={addData}
                        setDataAdd={setDataAdd}
                        postAddData={postAddData}
                        addProcessing={addProcessing}
                        resetAddData={resetAddData}
                        addErrors={addErrors}
                        editData={editDataNotStarted}
                        setEditData={setEditDataNotStarted}
                        postEditData={postEditDataNotStarted}
                        editProcessing={editProcessingNotStarted}
                        resetEditData={resetEditDataNotStarted}
                        editErrors={editErrorsNotStarted}
                        deleteTask={deleteTask}
                        onRowClick={handleRowClick}
                        tableType="not_started"
                    />

                    <TaskTable
                        tableTitle="In Progress"
                        borderColor="border-orange-600"
                        tableIcon="⌛"
                        data={inProgress.data}
                        employees_data={employees_data}
                        divisions_data={divisions_data}
                        paginationLinks={inProgress.links}
                        paginationCurrentPage={inProgress.current_page}
                        paginationPerPage={inProgress.per_page}
                        paginationTotal={inProgress.total}
                        paginationLastPage={inProgress.last_page}
                        addData={addData}
                        setDataAdd={setDataAdd}
                        postAddData={postAddData}
                        addProcessing={addProcessing}
                        resetAddData={resetAddData}
                        addErrors={addErrors}
                        editData={editDataInProgress}
                        setEditData={setEditDataInProgress}
                        postEditData={postEditDataInProgress}
                        editProcessing={editProcessingInProgress}
                        resetEditData={resetEditDataInProgress}
                        editErrors={editErrorsInProgress}
                        deleteTask={deleteTask}
                        onRowClick={handleRowClick}
                        tableType="in_progress"
                    />

                    <TaskTable
                        tableTitle="Completed"
                        borderColor="border-green-600"
                        tableIcon="✅"
                        data={completed.data}
                        employees_data={employees_data}
                        divisions_data={divisions_data}
                        paginationLinks={completed.links}
                        paginationCurrentPage={completed.current_page}
                        paginationPerPage={completed.per_page}
                        paginationTotal={completed.total}
                        paginationLastPage={completed.last_page}
                        addData={addData}
                        setDataAdd={setDataAdd}
                        postAddData={postAddData}
                        addProcessing={addProcessing}
                        resetAddData={resetAddData}
                        addErrors={addErrors}
                        editData={editDataCompleted}
                        setEditData={setEditDataCompleted}
                        postEditData={postEditDataCompleted}
                        editProcessing={editProcessingCompleted}
                        resetEditData={resetEditDataCompleted}
                        editErrors={editErrorsCompleted}
                        deleteTask={deleteTask}
                        onRowClick={handleRowClick}
                        tableType="completed"
                    />
                </div>
            </MainContainer>

        </AuthenticatedLayout >
    )
}