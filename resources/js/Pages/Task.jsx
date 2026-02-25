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
        users_data = [],
        divisions_data = [],
        userRole = 'user',
    } = props;

    const isUser = userRole === 'user';
    const isOred = userRole === 'ored';
    const isMs = userRole === 'ms';
    const isTs = userRole === 'ts';


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
                only: ['taskAll', 'completed', 'users_data', 'divisions_data'],
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

        setDataAdd('office', tableType); 
        
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
        due_date: null,
        created_at: null,
        office: activeTableType,
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
        description: '',
        created_at: null,
        office: activeTableType,
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
        description: '',
        created_at: null,
        office: activeTableType,
    })

    // Delete Task
    const deleteTask = (taskId) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        const loadingToast = toast.loading("Deleting task...");

        router.delete(route("task.destroy", taskId), {
            preserveState: true,
            preserveScroll: true,

            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success("Task deleted!");
            },

            onError: (errors) => {
                toast.dismiss(loadingToast);

                const messages = Object.values(errors || {})
                    .flat()
                    .join(" ");

                toast.error(messages || "You are not authorized to delete this task.");
            },

            onFinish: () => {
                toast.dismiss(loadingToast);
            }
        });
    };

    // Tab Filter Handler
    const handleOfficeTabClick = (office) => {
        setActiveTableType(office);

        router.visit(route('task.index'), {
            data: { office },
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    return (
        <AuthenticatedLayout
            header="Tasks"
        >
            <Head title="Tasks" />

            <MainContainer>
                {/* Sidebar - Desktop Only */}
                <div className="hidden lg:block">
                    <Sidebar
                        open={sidebarOpen}
                        task={viewedTask}
                        onClose={handleSidebarClose}
                    />
                </div>

                {/* Task Drawer - Mobile/Tablet Only */}
                <div className="lg:hidden">
                    <TaskDrawer
                        open={drawerOpen}
                        onClose={handleDrawerClose}
                        task={viewedTask}
                        users_data={users_data}
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
                        userRole={userRole}
                    />
                </div>

                {/* Task Lists - Mobile/Tablet Only */}
                <div className="flex flex-col gap-6 lg:gap-8 lg:hidden">
                    <TaskList
                        borderColor={
                            activeTableType === 'ored'
                                ? 'border-indigo-600'
                                : activeTableType === 'ms'
                                ? 'border-emerald-600'
                                : activeTableType === 'ts'
                                ? 'border-amber-500'
                                : 'border-gray-300'
                        }
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
                        borderColor={
                            activeTableType === 'ored'
                                ? 'border-indigo-600'
                                : activeTableType === 'ms'
                                ? 'border-emerald-600'
                                : activeTableType === 'ts'
                                ? 'border-amber-500'
                                : 'border-gray-300'
                        }
                        title="All Tasks"
                        icon="📄"
                        data={taskAll.data}
                        onTaskClick={handleTaskClick}
                        onAddClick={() => handleAddClick('task_all')}
                        showAddButton={false}
                        canModify={
                            (activeTableType === 'ored' && isOred) ||
                            (activeTableType === 'ms' && isMs) ||
                            (activeTableType === 'ts' && isTs)
                        }
                        paginationLinks={taskAll.links}
                        paginationCurrentPage={taskAll.current_page}
                        paginationPerPage={taskAll.per_page}
                        paginationTotal={taskAll.total}
                        paginationLastPage={taskAll.last_page}
                        tableType="task_all"
                    />

                </div>
                {!isUser && (
                    <div className="mb-8">
                        <div className="inline-flex rounded-xl bg-gray-100 dark:bg-zinc-800 p-1 shadow-sm">

                            <button
                                onClick={() => handleOfficeTabClick('ored')}
                                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
                                    ${activeTableType === 'ored'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                                    }`}
                            >
                                ORED
                            </button>

                            <button
                                onClick={() => handleOfficeTabClick('ms')}
                                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
                                    ${activeTableType === 'ms'
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                                    }`}
                            >
                                Management Services
                            </button>

                            <button
                                onClick={() => handleOfficeTabClick('ts')}
                                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
                                    ${activeTableType === 'ts'
                                        ? 'bg-amber-500 text-white shadow-md'
                                        : 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                                    }`}
                            >
                                Technical Services
                            </button>

                        </div>
                    </div>
                )}
                {/* Task Tables - Desktop Only */}
                <div className="hidden lg:flex flex-col gap-8">
                    <TaskTable
                        borderColor={
                            activeTableType === 'ored'
                                ? 'border-indigo-600'
                                : activeTableType === 'ms'
                                ? 'border-emerald-600'
                                : activeTableType === 'ts'
                                ? 'border-amber-500'
                                : 'border-gray-300'
                        }
                        tableTitle="Tasks"
                        userRole={userRole}
                        tableIcon="📄"
                        data={taskAll.data}
                        users_data={users_data}
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
                        canModify={
                            (activeTableType === 'ored' && isOred) ||
                            (activeTableType === 'ms' && isMs) ||
                            (activeTableType === 'ts' && isTs)
                        }
                    />


                    <TaskTable
                        tableTitle="Completed Tasks"
                    borderColor={
                        activeTableType === 'ored'
                            ? 'border-indigo-600'
                            : activeTableType === 'ms'
                            ? 'border-emerald-600'
                            : activeTableType === 'ts'
                            ? 'border-amber-500'
                            : 'border-gray-300'
                    }
                        tableIcon="✅"
                        userRole={userRole}
                        data={completed.data}
                        users_data={users_data}
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
                        canModify={
                            (activeTableType === 'ored' && isOred) ||
                            (activeTableType === 'ms' && isMs) ||
                            (activeTableType === 'ts' && isTs)
                        }
                    />
                </div>
            </MainContainer>

        </AuthenticatedLayout >
    )
}