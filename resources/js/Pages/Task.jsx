import { useState, useEffect } from "react";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { toast } from 'sonner';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import MainContainer from "@/Components/DivContainer/MainContainer";
import TaskTable from '@/Components/Table/TaskTable';
import TaskList from '@/Components/Task/TaskList';
import TaskDrawer from '@/Components/Task/TaskDrawer';
import Sidebar from "@/Components/Sidebar";


export default function Task() {
    // Props
    const { props } = usePage();
    const {
        taskAll = [],
        completed = [],
        employees_data = [],
        divisions_data = [],
    } = props;


    // Sidebar state (Desktop)
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Drawer state (Mobile/Tablet)
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewedTask, setViewedTask] = useState(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [activeTableType, setActiveTableType] = useState('');

    // Prevent body scroll when drawer or sidebar is open
    useEffect(() => {
        const isOpen = drawerOpen || sidebarOpen;
        
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            // Remove the inline style to restore default behavior
            document.body.style.removeProperty('overflow');
        }

        return () => {
            // Cleanup: ensure overflow is restored on unmount
            if (!drawerOpen && !sidebarOpen) {
                document.body.style.removeProperty('overflow');
            }
        }
    }, [drawerOpen, sidebarOpen]);

    // Sync viewedTask with updated task data from props
    useEffect(() => {
        if (viewedTask?.id) {
            // Find the updated task in any of the task arrays
            const allTasks = [
                ...taskAll.data,
                ...completed.data,
            ];
            const updatedTask = allTasks.find(t => t.id === viewedTask.id);
            // Only update if the task doesn't have updates loaded (to preserve full data)
            if (updatedTask && !viewedTask.updates && JSON.stringify(updatedTask) !== JSON.stringify(viewedTask)) {
                // Merge updates if available in viewedTask
                if (viewedTask.updates) {
                    setViewedTask({ ...updatedTask, updates: viewedTask.updates });
                } else {
                    setViewedTask(updatedTask);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskAll.data, completed.data]);

    // Polling: Fetch latest data from backend
    useEffect(() => {
        // Don't poll if drawer or sidebar is open to avoid conflicts
        if (drawerOpen || sidebarOpen) {
            return;
        }

        // Poll every 30 seconds
        const pollInterval = setInterval(() => {
            // Get current URL parameters to preserve them
            const currentParams = Object.fromEntries(
                new URLSearchParams(window.location.search)
            );

            // Reload data with current parameters
            router.get(route('task.index'), currentParams, {
                preserveState: true,
                preserveScroll: true,
                only: ['taskAll', 'completed', 'employees_data', 'divisions_data'],
            });
        }, 30000); // 30 seconds

        // Cleanup interval on unmount or when drawer/sidebar opens
        return () => {
            clearInterval(pollInterval);
        };
    }, [drawerOpen, sidebarOpen]);

    const handleTaskClick = async (task) => {
        // Fetch full task data with updates
        try {
            const response = await fetch(route('task.show', task.id));
            const data = await response.json();
            if (data.task) {
                setViewedTask(data.task);
            } else {
                setViewedTask(task);
            }
        } catch (error) {
            // Fallback to using the task from list if fetch fails
            setViewedTask(task);
        }
        setIsAddMode(false);
        setDrawerOpen(true);
        setSidebarOpen(true);
    }

    const handleAddClick = (tableType) => {
        setActiveTableType(tableType);
        setViewedTask(null);
        setIsAddMode(true);
        setDrawerOpen(true);
        resetAddData();
    }

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSidebarOpen(false); // Also close sidebar
        setIsAddMode(false);
        setViewedTask(null);
        resetAddData();
    }

    const handleSidebarClose = () => {
        setDrawerOpen(false); // Also close drawer
        setSidebarOpen(false);
        setViewedTask(null);
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
        due_date: '',
        description: ''
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
        due_date: '',
        description: ''
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
            header="Tasks"
        >
            <Head title="Tasks" />

            <MainContainer>
                {/* Sidebar - Desktop Only */}
                <div className="hidden md:block">
                    <Sidebar
                        open={sidebarOpen}
                        task={viewedTask}
                        onClose={handleSidebarClose}
                    />
                </div>

                {/* Task Drawer - Mobile/Tablet Only */}
                <div className="md:hidden">
                    <TaskDrawer
                        open={drawerOpen}
                        onClose={handleDrawerClose}
                        task={viewedTask}
                        employees_data={employees_data}
                        divisions_data={divisions_data}
                        editData={editDataTaskAll}
                        setEditData={setEditDataTaskAll}
                        postEditData={postEditDataTaskAll}
                        editProcessing={editProcessingTaskAll}
                        resetEditData={resetEditDataTaskAll}
                        editErrors={editErrorsTaskAll}
                        deleteTask={deleteTask}
                        isAddMode={isAddMode}
                        addData={addData}
                        setDataAdd={setDataAdd}
                        postAddData={postAddData}
                        addProcessing={addProcessing}
                        resetAddData={resetAddData}
                        addErrors={addErrors}
                        tableType={activeTableType}
                    />
                </div>

                {/* Task Lists - Mobile/Tablet Only */}
                <div className="flex flex-col gap-6 md:gap-8 md:hidden">
                    <TaskList
                        borderColor="border-violet-600"
                        title="All Tasks"
                        icon="📄"
                        data={taskAll.data}
                        onTaskClick={handleTaskClick}
                        onAddClick={() => handleAddClick('task_all')}
                        showAddButton={true}
                        paginationLinks={taskAll.links}
                        paginationCurrentPage={taskAll.current_page}
                        paginationPerPage={taskAll.per_page}
                        paginationTotal={taskAll.total}
                        paginationLastPage={taskAll.last_page}
                        tableType="task_all"
                    />

                    <TaskList
                        borderColor="border-green-600"
                        title="Completed"
                        icon="✅"
                        data={completed.data}
                        onTaskClick={handleTaskClick}
                        onAddClick={() => handleAddClick('completed')}
                        showAddButton={true}
                        paginationLinks={completed.links}
                        paginationCurrentPage={completed.current_page}
                        paginationPerPage={completed.per_page}
                        paginationTotal={completed.total}
                        paginationLastPage={completed.last_page}
                        tableType="completed"
                    />
                </div>

                {/* Task Tables - Desktop Only */}
                <div className="hidden md:flex flex-col gap-8">
                    <TaskTable
                        borderColor="border-violet-600"
                        tableTitle="Tasks"
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
                        onRowClick={handleTaskClick}
                        tableType="task_all"
                    />


                    <TaskTable
                        tableTitle="Completed Tasks"
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
                        onRowClick={handleTaskClick}
                        tableType="completed"
                    />
                </div>
            </MainContainer>

        </AuthenticatedLayout >
    )
}