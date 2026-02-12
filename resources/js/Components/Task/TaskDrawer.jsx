import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { SelectItem } from "@/Components/ui/select";
import { toast } from 'sonner';
import PrimaryInput from '../Form/PrimaryInput';
import SelectInput from '../Form/SelectInput';
import MultiSelectInput from '../Form/MultiSelectInput';
import Datepicker from '../Form/Datepicker';
import PrimaryButton from '../Button/PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import DangerButton from '../DangerButton';
import StatusContainer from '../Misc/StatusContainer';
import PriorityContainer from '../Misc/PriorityContainer';
import DivisionContainer from '../Misc/DivisionContainer';
import DateContainer from '../Misc/DateContainer';
import { format } from 'date-fns';

export default function TaskDrawer({
    open,
    onClose,
    task,
    users_data = [],
    divisions_data = [],
    editData,
    setEditData,
    postEditData,
    editProcessing,
    resetEditData,
    editErrors,
    deleteTask,
    isAddMode = false,
    addData,
    setDataAdd,
    postAddData,
    addProcessing,
    resetAddData,
    addErrors,
    tableType = ''
}) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddModeActive, setIsAddModeActive] = useState(isAddMode);
    const [currentTask, setCurrentTask] = useState(task);
    const [taskUpdates, setTaskUpdates] = useState([]);

    // Sync edit mode with add mode
    useEffect(() => {
        setIsAddModeActive(isAddMode);
        if (isAddMode) {
            setIsEditMode(true);
        }
    }, [isAddMode]);

    // Reset edit mode when drawer closes
    useEffect(() => {
        if (!open) {
            setIsEditMode(false);
            setIsAddModeActive(false);
        }
    }, [open]);

    // Update currentTask when task prop changes
    useEffect(() => {
        if (task) {
            setCurrentTask(task);
            setTaskUpdates(task?.updates || []);
        }
    }, [task]);

    // Fetch full task data with updates when drawer opens
    useEffect(() => {
        if (open && task?.id && !isAddModeActive) {
            fetch(route('task.show', task.id))
                .then(res => res.json())
                .then(data => {
                    if (data.task) {
                        setCurrentTask(data.task);
                        setTaskUpdates(data.task.updates || []);
                    }
                })
                .catch(() => {
                    // Fallback to task from props
                    setCurrentTask(task);
                    setTaskUpdates(task?.updates || []);
                });
        }
    }, [open, task?.id, isAddModeActive]);

    // Formatting Functions
    const formatStatusToDb = (value) => {
        const map = {
            'Not Started': 'not_started',
            'In Progress': 'in_progress',
            'Completed': 'completed',
        }
        return map[value] || value;
    }

    const formatPriorityToDb = (value) => {
        const map = {
            'High': 'high',
            'Medium': 'medium',
            'Low': 'low',
        }
        return map[value] || value;
    }

    const formatDateToSave = (value) => {
        if (!value) return '';
        const date = value instanceof Date ? value : new Date(value);
        return format(date, 'yyyy-MM-dd');
    }

    const preselectStatus = (tableType) => {
        if (tableType === "not_started") return "not_started";
        if (tableType === "in_progress") return "in_progress";
        if (tableType === "completed") return "completed";
        return '';
    }

    // Update form data
    const updateFormData = (field, value) => {
        if (isAddModeActive) {
            setDataAdd((data) => ({
                ...data,
                [field]: value,
            }));
        } else {
            setEditData((data) => ({
                ...data,
                [field]: value,
            }));
        }
    }

    // Helper function to initialize edit data from task
    const initializeEditData = () => {
        const taskToUse = currentTask || task;
        if (taskToUse && !isAddModeActive) {
            // Parse due_date from "m/d/Y" format to Date object
            let parsedDueDate = '';
            if (taskToUse.due_date) {
                try {
                    // Parse "m/d/Y" format
                    const [month, day, year] = taskToUse.due_date.split('/');
                    if (month && day && year) {
                        parsedDueDate = new Date(year, month - 1, day);
                    }
                } catch (e) {
                    // If parsing fails, try direct Date conversion
                    parsedDueDate = new Date(taskToUse.due_date);
                }
            }

            // Handle both old format (single division) and new format (array of divisions)
            const divisionIds = taskToUse.divisions && taskToUse.divisions.length > 0
                ? taskToUse.divisions.map(d => String(d.id))
                : taskToUse.division?.id 
                    ? [String(taskToUse.division.id)]
                    : [];

            const assigneeIds = taskToUse?.users?.length
                ? taskToUse.users.map(u => String(u.id))
                : [];


            setEditData({
                task_name: taskToUse.name || '',
                assignee: assigneeIds,
                division: divisionIds,
                last_action: taskToUse.latest_update?.update_text || taskToUse.last_action || '',
                status: formatStatusToDb(taskToUse.status) || '',
                priority: formatPriorityToDb(taskToUse.priority) || '',
                due_date: parsedDueDate || '',
                description: taskToUse.description || '',
                showAddUpdate: false,
                newUpdateText: '',
                editingUpdateId: null,
                editUpdateText: '',
            });
        }
    }

    // Initialize edit data when task changes
    useEffect(() => {
        initializeEditData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTask, task, isAddModeActive]);

    // Re-initialize edit data when entering edit mode
    useEffect(() => {
        if (isEditMode && !isAddModeActive && (currentTask || task)) {
            initializeEditData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode]);

    // Initialize add data
    useEffect(() => {
        if (isAddModeActive && !addData.status) {
            setDataAdd((data) => ({
                ...data,
                status: preselectStatus(tableType),
            }));
        }
    }, [isAddModeActive, tableType]);

    // Save Edit
    const saveEdit = () => {
        const taskId = currentTask?.id || task?.id;
        if (!taskId) return;

        postEditData(route('task.update', taskId), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success("Task updated successfully!");
                setIsEditMode(false);
                resetEditData();
                // Reload task data with updates
                if (taskId) {
                    fetch(route('task.show', taskId))
                        .then(res => res.json())
                        .then(data => {
                            if (data.task) {
                                setCurrentTask(data.task);
                                setTaskUpdates(data.task.updates || []);
                            }
                        })
                        .catch(() => {});
                }
                router.reload({ only: ['taskAll', 'completed'] });
            },
            onError: (errors) => {
                const messages = Object.values(errors).flat().join(" ");
                toast.error(messages || "Something went wrong.");
            },
        });
    }

    // Save Add
    const saveAdd = () => {
        postAddData(route('task.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success("Task added successfully!");
                resetAddData();
                setIsAddModeActive(false);
                setIsEditMode(false);
                onClose();
            },
            onError: (errors) => {
                const messages = Object.values(errors).flat().join(" ");
                toast.error(messages || "Something went wrong");
            }
        });
    }

    // Handle delete
    const handleDelete = () => {
        const taskId = currentTask?.id || task?.id;
        if (!taskId) return;
        if (!confirm("Are you sure you want to delete this task?")) return;

        toast.loading("Deleting task...");

        deleteTask(taskId);
    }

    const currentData = isAddModeActive ? addData : editData;
    const currentErrors = isAddModeActive ? addErrors : editErrors;
    const currentProcessing = isAddModeActive ? addProcessing : editProcessing;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-90 transition-opacity
                    ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
            />

            {/* Drawer */}
            <div
                className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 shadow-lg z-[100] rounded-t-2xl
                    transform transition-transform duration-300 ease-in-out max-h-[90vh] overflow-y-auto drawer-scrollbar
                    ${open ? "translate-y-0" : "translate-y-full"}`}
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgb(156 163 175) rgb(229 231 235)'
                }}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex justify-between items-center z-10 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white pr-4">
                        {isAddModeActive ? 'Add New Task' : (currentTask?.name || task?.name || 'Task Details')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-2xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex-shrink-0"
                        aria-label="Close drawer"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {isAddModeActive || isEditMode ? (
                        /* Edit/Add Form */
                        <div className="space-y-4">
                            <PrimaryInput
                                type="text"
                                label="Task Name"
                                placeholder="Enter task name"
                                value={currentData.task_name || ''}
                                onChange={(e) => updateFormData("task_name", e.target.value)}
                                error={currentErrors?.task_name}
                            />

                            <SelectInput
                                label="Assignee"
                                placeholder="Select Assignee"
                                value={currentData.assignee}
                                onChange={(value) => updateFormData("assignee", value)}
                                error={currentErrors?.assignee}
                            >
                                {users_data.map((user) => (
                                    <SelectItem key={user.id} value={String(user.id)}>
                                        {user.first_name} {user.last_name}
                                    </SelectItem>
                                ))}
                            </SelectInput>

                            <MultiSelectInput
                                label="Division"
                                placeholder="Select Division(s)"
                                options={divisions_data}
                                value={Array.isArray(currentData.division) ? currentData.division : currentData.division ? [currentData.division] : []}
                                onChange={(value) => updateFormData("division", value)}
                                error={currentErrors?.division}
                            />

                            <PrimaryInput
                                type="text"
                                label="Latest Update"
                                placeholder="Enter update (will create new history entry)"
                                value={currentData.last_action || ''}
                                onChange={(e) => updateFormData("last_action", e.target.value)}
                                error={currentErrors?.last_action}
                            />

                            <SelectInput
                                label="Status"
                                placeholder="Select Status"
                                value={currentData.status || preselectStatus(tableType)}
                                onChange={(value) => updateFormData("status", value)}
                                error={currentErrors?.status}
                            >
                                <SelectItem value="not_started">Not Started</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectInput>

                            <Datepicker
                                label="Due Date"
                                value={currentData.due_date ? (currentData.due_date instanceof Date ? currentData.due_date : (currentData.due_date ? new Date(currentData.due_date) : null)) : null}
                                onChange={(date) => updateFormData("due_date", date ? formatDateToSave(date) : '')}
                            />

                            <SelectInput
                                label="Priority"
                                placeholder="Select Priority"
                                value={currentData.priority}
                                onChange={(value) => updateFormData("priority", value)}
                                error={currentErrors?.priority}
                            >
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectInput>

                            <div className="space-y-2">
                                <label className="text-black dark:text-white">Description</label>
                                <textarea
                                    value={currentData.description || ''}
                                    onChange={(e) => updateFormData("description", e.target.value)}
                                    className="w-full min-h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white resize-y"
                                    placeholder="Enter task description"
                                />
                                {currentErrors?.description && (
                                    <p className="text-red-600 dark:text-red-500">{currentErrors.description}</p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <PrimaryButton
                                    text={isAddModeActive ? "Add Task" : "Save Changes"}
                                    onClick={isAddModeActive ? saveAdd : saveEdit}
                                    disabled={currentProcessing}
                                    className="flex-1"
                                />
                                <SecondaryButton
                                    text="Cancel"
                                    onClick={() => {
                                        if (isAddModeActive) {
                                            resetAddData();
                                            setIsAddModeActive(false);
                                            setIsEditMode(false);
                                            onClose();
                                        } else {
                                            setIsEditMode(false);
                                            resetEditData();
                                        }
                                    }}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    ) : (
                        /* View Mode */
                        <>
                            {/* Status and Priority - Top Right */}
                            <div className="flex flex-wrap gap-3 justify-end mb-4">
                                <StatusContainer status={currentTask?.status || task?.status}>
                                    {currentTask?.status || task?.status}
                                </StatusContainer>
                                <PriorityContainer priority={currentTask?.priority || task?.priority}>
                                    {currentTask?.priority || task?.priority || 'No priority set.'}
                                </PriorityContainer>
                            </div>

                            {/* Description */}
                            <div className="space-y-2 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    {currentTask?.description || task?.description || "No description."}
                                </p>
                            </div>

                            {/* Details Grid - 2 columns on larger screens, 1 on mobile */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4">📅 Due Date</h4>
                                    <DateContainer 
                                        bgcolor="bg-red-100"
                                        textColor="text-gray-900 dark:text-gray-100"
                                    >
                                        {(currentTask?.due_date || task?.due_date) ? (currentTask?.due_date || task?.due_date) : "No due date set."}
                                    </DateContainer>
                                </div>
                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4">📆 Date Created</h4>
                                    <DateContainer bgcolor="bg-blue-100">
                                        {(currentTask?.created_at || task?.created_at) ? (currentTask?.created_at || task?.created_at) : "N/A"}
                                    </DateContainer>
                                </div>

                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">👤 Assigned To</h4>
                                    <p className="text-violet-500 dark:text-violet-400 font-semibold text-sm">
                                        {(currentTask?.user || task?.user) ? `${(currentTask?.user || task?.user).first_name} ${(currentTask?.user || task?.user).last_name}` : "Not assigned"}
                                    </p>
                                </div>

                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-4">🔰 Division</h4>
                                    {(currentTask?.divisions || task?.divisions) && (currentTask?.divisions || task?.divisions).length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {(currentTask?.divisions || task?.divisions).map((division) => (
                                                <DivisionContainer 
                                                    key={division.id} 
                                                    bgcolor={division.division_color}
                                                    compact={(currentTask?.divisions || task?.divisions).length > 3}
                                                >
                                                    {division.division_name}
                                                </DivisionContainer>
                                            ))}
                                        </div>
                                    ) : (currentTask?.division || task?.division) ? (
                                        <DivisionContainer bgcolor={(currentTask?.division || task?.division).division_color}>
                                            {(currentTask?.division || task?.division).division_name}
                                        </DivisionContainer>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">No division assigned</p>
                                    )}
                                </div>

                            </div>

                            {/* Task History/Updates */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-foreground">History</h3>
                                    {!currentData.showAddUpdate && (
                                        <PrimaryButton
                                            text="+ Add Update"
                                            onClick={() => {
                                                updateFormData("showAddUpdate", true);
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Add New Update Form */}
                                {currentData.showAddUpdate && (
                                    <div className="p-4 border border-input rounded-lg bg-card space-y-3">
                                        <PrimaryInput
                                            type="text"
                                            placeholder="Enter update..."
                                            value={currentData.newUpdateText || ''}
                                            onChange={(e) => updateFormData("newUpdateText", e.target.value)}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <SecondaryButton
                                                text="Cancel"
                                                onClick={() => {
                                                    updateFormData("showAddUpdate", false);
                                                    updateFormData("newUpdateText", "");
                                                }}
                                            />
                                            <PrimaryButton
                                                text="Save"
                                                onClick={() => {
                                                    if (!currentData.newUpdateText?.trim()) {
                                                        toast.error("Update text cannot be empty");
                                                        return;
                                                    }
                                                    router.post(route('task.updates.store', currentTask?.id || task?.id), {
                                                        update_text: currentData.newUpdateText,
                                                    }, {
                                                        preserveScroll: true,
                                                        preserveState: true,
                                                        onSuccess: () => {
                                                            toast.success("Update added successfully!");
                                                            updateFormData("newUpdateText", "");
                                                            updateFormData("showAddUpdate", false);
                                                            // Reload updates
                                                            fetch(route('task.show', currentTask?.id || task?.id))
                                                                .then(res => res.json())
                                                                .then(data => {
                                                                    if (data.task) {
                                                                        setCurrentTask(data.task);
                                                                        setTaskUpdates(data.task.updates || []);
                                                                    }
                                                                })
                                                                .catch(() => {});
                                                            router.reload({ only: ['taskAll', 'completed'] });
                                                        },
                                                        onError: (errors) => {
                                                            const messages = Object.values(errors).flat().join(" ");
                                                            toast.error(messages || "Something went wrong");
                                                        }
                                                    });
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Updates List */}
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {taskUpdates.length > 0 ? (
                                        taskUpdates.map((update) => (
                                            <div
                                                key={update.id}
                                                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900"
                                            >
                                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                    {update.update_text}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {update.created_at || 'Just now'}
                                                        {update.user && ` • by ${update.user.name}`}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                const editingId = currentData.editingUpdateId === update.id ? null : update.id;
                                                                updateFormData("editingUpdateId", editingId);
                                                                updateFormData("editUpdateText", editingId ? update.update_text : "");
                                                            }}
                                                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                        >
                                                            {currentData.editingUpdateId === update.id ? 'Cancel' : 'Edit'}
                                                        </button>
                                                        {currentData.editingUpdateId === update.id ? (
                                                            <button
                                                                onClick={() => {
                                                                    if (!currentData.editUpdateText?.trim()) {
                                                                        toast.error("Update text cannot be empty");
                                                                        return;
                                                                    }
                                                                    router.patch(route('task.updates.update', [currentTask?.id || task?.id, update.id]), {
                                                                        update_text: currentData.editUpdateText,
                                                                    }, {
                                                                        preserveScroll: true,
                                                                        preserveState: true,
                                                                        onSuccess: () => {
                                                                            toast.success("Update updated successfully!");
                                                                            updateFormData("editingUpdateId", null);
                                                                            updateFormData("editUpdateText", "");
                                                                    // Reload updates
                                                                    fetch(route('task.show', currentTask?.id || task?.id))
                                                                        .then(res => res.json())
                                                                        .then(data => {
                                                                            if (data.task) {
                                                                                setCurrentTask(data.task);
                                                                                setTaskUpdates(data.task.updates || []);
                                                                            }
                                                                        })
                                                                        .catch(() => {});
                                                                    router.reload({ only: ['taskAll', 'completed'] });
                                                                },
                                                                onError: (errors) => {
                                                                    const messages = Object.values(errors).flat().join(" ");
                                                                    toast.error(messages || "Something went wrong");
                                                                }
                                                            });
                                                        }}
                                                        className="text-xs text-green-600 dark:text-green-400 hover:underline"
                                                    >
                                                        Save
                                                    </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    if (!confirm("Are you sure you want to delete this update?")) return;
                                                                    router.delete(route('task.updates.destroy', [currentTask?.id || task?.id, update.id]), {
                                                                        preserveScroll: true,
                                                                        preserveState: true,
                                                                        onSuccess: () => {
                                                                            toast.success("Update deleted successfully!");
                                                                    // Reload updates
                                                                    fetch(route('task.show', currentTask?.id || task?.id))
                                                                        .then(res => res.json())
                                                                        .then(data => {
                                                                            if (data.task) {
                                                                                setCurrentTask(data.task);
                                                                                setTaskUpdates(data.task.updates || []);
                                                                            }
                                                                        })
                                                                        .catch(() => {});
                                                                    router.reload({ only: ['taskAll', 'completed'] });
                                                                },
                                                                onError: (errors) => {
                                                                    const messages = Object.values(errors).flat().join(" ");
                                                                    toast.error(messages || "Something went wrong");
                                                                }
                                                            });
                                                        }}
                                                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {currentData.editingUpdateId === update.id && (
                                                    <div className="mt-2">
                                                        <PrimaryInput
                                                            type="text"
                                                            value={currentData.editUpdateText || ''}
                                                            onChange={(e) => updateFormData("editUpdateText", e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (currentTask?.latest_update || task?.latest_update) ? (
                                        <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                {(currentTask?.latest_update || task?.latest_update).update_text}
                                            </p>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {(currentTask?.latest_update || task?.latest_update).created_at || 'Just now'}
                                                {(currentTask?.latest_update || task?.latest_update).user && ` • by ${(currentTask?.latest_update || task?.latest_update).user.name}`}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                                            No updates yet. Add an update to track task progress.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <PrimaryButton
                                    text="Edit Task"
                                    onClick={() => setIsEditMode(true)}
                                />
                                {(currentTask || task) && (
                                    <DangerButton
                                        onClick={handleDelete}
                                        className="flex-1"
                                    >
                                        Delete Task
                                    </DangerButton>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

