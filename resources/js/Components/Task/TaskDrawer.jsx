import { useState, useEffect } from 'react';
import { SelectItem } from "@/components/ui/select";
import { toast } from 'sonner';
import PrimaryInput from '../Form/PrimaryInput';
import SelectInput from '../Form/SelectInput';
import Datepicker from '../Form/Datepicker';
import PrimaryButton from '../Button/PrimaryButton';
import StatusContainer from '../Misc/StatusContainer';
import PriorityContainer from '../Misc/PriorityContainer';
import DivisionContainer from '../Misc/DivisionContainer';
import DateContainer from '../Misc/DateContainer';
import { format } from 'date-fns';

export default function TaskDrawer({
    open,
    onClose,
    task,
    employees_data = [],
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

    // Initialize edit data when task changes
    useEffect(() => {
        if (task && !isAddModeActive) {
            // Parse due_date from "m/d/Y" format to Date object
            let parsedDueDate = '';
            if (task.due_date) {
                try {
                    // Parse "m/d/Y" format
                    const [month, day, year] = task.due_date.split('/');
                    if (month && day && year) {
                        parsedDueDate = new Date(year, month - 1, day);
                    }
                } catch (e) {
                    // If parsing fails, try direct Date conversion
                    parsedDueDate = new Date(task.due_date);
                }
            }

            setEditData({
                task_name: task.name || '',
                assignee: task.employee?.id ? String(task.employee.id) : '',
                division: task.division?.id ? String(task.division.id) : '',
                last_action: task.last_action || '',
                status: formatStatusToDb(task.status) || '',
                priority: formatPriorityToDb(task.priority) || '',
                due_date: parsedDueDate || '',
                description: task.description || '',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task, isAddModeActive]);

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
        if (!task) return;

        postEditData(route('task.update', task.id), {
            method: 'patch',
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success("Task updated successfully!");
                setIsEditMode(false);
                resetEditData();
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
            method: 'post',
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
        if (!task) return;
        if (!confirm("Are you sure you want to delete this task?")) return;

        toast.loading("Deleting task...");

        deleteTask(task.id);
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
                        {isAddModeActive ? 'Add New Task' : task?.name || 'Task Details'}
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
                                {employees_data.map((employee) => (
                                    <SelectItem key={employee.id} value={String(employee.id)}>
                                        {employee.first_name} {employee.last_name}
                                    </SelectItem>
                                ))}
                            </SelectInput>

                            <SelectInput
                                label="Division"
                                placeholder="Select Division"
                                value={currentData.division}
                                onChange={(value) => updateFormData("division", value)}
                                error={currentErrors?.division}
                            >
                                {divisions_data.map((division) => (
                                    <SelectItem key={division.id} value={String(division.id)}>
                                        {division.division_name}
                                    </SelectItem>
                                ))}
                            </SelectInput>

                            <PrimaryInput
                                type="text"
                                label="Last Action"
                                placeholder="Enter last action"
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
                                />
                                <button
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
                                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm py-2 px-4 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* View Mode */
                        <>
                            {/* Status and Priority - Top Right */}
                            <div className="flex flex-wrap gap-3 justify-end mb-4">
                                <StatusContainer status={task?.status}>
                                    {task?.status}
                                </StatusContainer>
                                <PriorityContainer priority={task?.priority}>
                                    {task?.priority || 'No priority set.'}
                                </PriorityContainer>
                            </div>

                            {/* Description */}
                            <div className="space-y-2 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    {task?.description || "No description."}
                                </p>
                            </div>

                            {/* Details Grid - 2 columns on larger screens, 1 on mobile */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4">📅 Due Date</h4>
                                    <DateContainer bgcolor="bg-red-100">
                                        {task?.due_date ? task.due_date : "No due date set."}
                                    </DateContainer>
                                </div>

                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">👤 Assigned To</h4>
                                    <p className="text-violet-500 dark:text-violet-400 font-semibold text-sm">
                                        {task?.employee ? `${task.employee.first_name} ${task.employee.last_name}` : "Not assigned"}
                                    </p>
                                </div>

                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4">🔰 Division</h4>
                                    {task?.division ? (
                                        <DivisionContainer bgcolor={task.division.division_color}>
                                            {task.division.division_name}
                                        </DivisionContainer>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">No division assigned</p>
                                    )}
                                </div>

                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Last Action</h4>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                        {task?.last_action || "No last action."}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <PrimaryButton
                                    text="Edit Task"
                                    onClick={() => setIsEditMode(true)}
                                />
                                {task && (
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 bg-red-600 text-white text-sm py-2.5 px-4 rounded cursor-pointer hover:bg-red-700 transition duration-300 font-medium"
                                    >
                                        Delete Task
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

