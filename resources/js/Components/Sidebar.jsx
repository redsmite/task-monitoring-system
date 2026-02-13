import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { toast } from 'sonner';
import StatusContainer from "./Misc/StatusContainer";
import PriorityContainer from "./Misc/PriorityContainer";
import DivisionContainer from "./Misc/DivisionContainer";
import DateContainer from "./Misc/DateContainer";
import PrimaryInput from "./Form/PrimaryInput";
import PrimaryButton from "./Button/PrimaryButton";
import PrimaryButtonChildren from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import IconButton from "./Button/IconButton";
import { usePage } from "@inertiajs/react";

export default function Sidebar({ open, onClose, task }) {
    // Admin Control
    const { props } = usePage();
    const userRole = props.userRole || 'user';
    const isAdmin = userRole === 'admin';

    // Description
    const [editDescriptionId, setEditDescriptionId] = useState(null);
    const [descriptionValue, setDescriptionValue] = useState(task?.description || "");

    // Task Updates/History
    const [updates, setUpdates] = useState([]);
    const [currentTask, setCurrentTask] = useState(task);
    const [editingUpdateId, setEditingUpdateId] = useState(null);
    const [editUpdateText, setEditUpdateText] = useState("");
    const [newUpdateText, setNewUpdateText] = useState("");
    const [showAddUpdate, setShowAddUpdate] = useState(false);
    const assignee = currentTask?.users || task?.users;

    // Fetch full task data with updates when sidebar opens
    useEffect(() => {
        if (open && task?.id) {
            fetch(route('task.show', task.id))
                .then(res => res.json())
                .then(data => {
                    if (data.task) {
                        setCurrentTask(data.task);
                        setUpdates(data.task.updates || []);
                    }
                })
                .catch(() => {
                    // Fallback to task from props
                    setCurrentTask(task);
                    if (task?.updates) {
                        setUpdates(task.updates);
                    } else if (task?.latest_update) {
                        setUpdates([task.latest_update]);
                    } else {
                        setUpdates([]);
                    }
                });
        } else {
            setCurrentTask(task);
            if (task?.updates) {
                setUpdates(task.updates);
            } else if (task?.latest_update) {
                setUpdates([task.latest_update]);
            } else {
                setUpdates([]);
            }
        }
    }, [open, task?.id]);

    // Sync descriptionValue with task prop when task changes
    useEffect(() => {
        setDescriptionValue(currentTask?.description || task?.description || "");
    }, [currentTask?.description, task?.description]);

    const ToggleDescriptionEdit = (task) => {
        setEditDescriptionId(task.id);
        setDescriptionValue(task?.description || "");
    }

    const saveDescription = (taskId) => {
        router.put(route('task.update', taskId), {
            description: descriptionValue,
        },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setEditDescriptionId(null);
                    toast.success("Description updated");
                },
                onError: (errors) => {
                    const messages = Object.values(errors).flat().join(" ");
                    toast.error(messages || "Something went wrong");
                }
            }
        );
    }

    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-90 transition-opacity
                    ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
            />

            <div
                className={`fixed top-0 right-0 h-full w-160 bg-white dark:bg-zinc-800 shadow-lg z-100 overflow-auto
                    transform transition-transform duration-300 ease-in-out
                    ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="py-5 px-4 flex justify-between items-center border-b">
                    <IconButton
                        icon={<span>✕</span>}
                        iconColor="muted"
                        onClick={onClose}
                        tooltip="close task view"
                    />
                </div>

                <div className="p-4 space-y-6">
                    <div className="flex justify-end gap-4">
                        <StatusContainer
                            status={currentTask?.status || task?.status}
                        >
                            {currentTask?.status || task?.status}
                        </StatusContainer>
                        <PriorityContainer
                            priority={(currentTask?.priority || task?.priority) ? (currentTask?.priority || task?.priority) : ''}
                        >
                            {(currentTask?.priority || task?.priority) ? (currentTask?.priority || task?.priority) : "No priority set."}
                        </PriorityContainer>
                    </div>

                    <div>
                        <h1 className="text-3xl font-semibold">{currentTask?.name || task?.name}</h1>
                    </div>

                    <div
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition space-y-2"
                    >
                        <div className="flex justify-center">
                            <h1 className="text-md font-semibold">📅Date Instructed</h1>
                        </div>
                        <div className="flex flex-1 justify-center items-center">
                            <DateContainer
                                bgcolor="bg-red-100"
                                textColor="text-red-600"
                            >
                                {currentTask?.created_at || task?.created_at ? `${currentTask?.created_at || task?.created_at}` : "No due date set."}
                            </DateContainer>
                        </div>
                    </div>

                                        <div
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition space-y-2"
                    >
                        <div className="flex justify-center">
                            <h1 className="text-md font-semibold">📅Due Date</h1>
                        </div>
                        <div className="flex flex-1 justify-center items-center">
                            <DateContainer
                                bgcolor="bg-red-100"
                                textColor="text-red-600"
                            >
                                {currentTask?.due_date || task?.due_date ? `${currentTask?.due_date || task?.due_date}` : "No due date set."}
                            </DateContainer>
                        </div>
                    </div>

                    <div
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition space-y-2"
                    >
                        <div className="flex justify-center">
                            <h1 className="text-md font-semibold">👤Assigned To</h1>
                        </div>
                            <div className="flex flex-1 justify-center items-center">
                                {assignee && assignee.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {assignee.map((user) => (
                                            <p key={user.id} className="text-violet-500 font-semibold">
                                                {user.first_name} {user.last_name}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Not assigned</p>
                                )}
                            </div>
                    </div>

                    <div
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition space-y-2"
                    >
                        <div className="flex justify-center">
                            <h1 className="text-md font-semibold">🔰Division</h1>
                        </div>
                        <div className="flex flex-1 justify-center items-center">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {(currentTask?.divisions || task?.divisions) && (currentTask?.divisions || task?.divisions).length > 0 ? (
                                    (currentTask?.divisions || task?.divisions).map((division) => (
                                        <DivisionContainer
                                            key={division.id}
                                            bgcolor={division.division_color}
                                            compact={(currentTask?.divisions || task?.divisions).length > 2}
                                        >
                                            {division.division_name}
                                        </DivisionContainer>
                                    ))
                                ) : (currentTask?.division || task?.division) ? (
                                    <DivisionContainer
                                        bgcolor={(currentTask?.division || task?.division).division_color}
                                    >
                                        {(currentTask?.division || task?.division).division_name}
                                    </DivisionContainer>
                                ) : (
                                    <p className="text-gray-500 text-sm">No division</p>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-semibold">Description</h1>
                        {isAdmin && (
                            editDescriptionId !== (currentTask?.id || task?.id) ? (
                                <div className="w-auto">
                                    <PrimaryButton
                                        text="✏️ Edit Description"
                                        onClick={() => ToggleDescriptionEdit(currentTask || task)}
                                    />
                                </div>
                            ) : (
                                <SecondaryButton
                                    text="Cancel"
                                    onClick={() => {
                                        setEditDescriptionId(null);
                                        setDescriptionValue(currentTask?.description || task?.description || "");
                                    }}
                                />
                            )
                        )}
                    </div>
                    <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 space-y-3">
                        <div>
                            {editDescriptionId === (currentTask?.id || task?.id) ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={descriptionValue}
                                        onChange={(e) => setDescriptionValue(e.target.value)}
                                        className="w-full h-full text-sm border rounded p-2 resize-none"
                                        autoFocus
                                        maxLength={200}
                                        rows={4}
                                    />
                                    <div className="flex gap-2">
                                        <PrimaryButton
                                            text="Save"
                                            onClick={() => saveDescription(currentTask?.id || task?.id)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold italic max-w-full break-words">
                                    {descriptionValue ? descriptionValue : "Add a short description or note."}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Task History/Updates */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-semibold">History</h1>

                            {isAdmin && (
                                !showAddUpdate ? (
                                    <PrimaryButton
                                        text="➕ Add Action"
                                        onClick={() => setShowAddUpdate(true)}
                                    />
                                ) : (
                                    <SecondaryButton
                                        text="Cancel"
                                        onClick={() => {
                                            setShowAddUpdate(false);
                                            setNewUpdateText("");
                                        }}
                                    />
                                )
                            )}
                        </div>

                        {/* Add New Update Form */}
                        {showAddUpdate && (
                            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-zinc-900 space-y-3">
                                <PrimaryInput
                                    type="text"
                                    placeholder="Enter action..."
                                    value={newUpdateText}
                                    onChange={(e) => setNewUpdateText(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <PrimaryButton
                                        text="Save"
                                        onClick={() => {
                                            if (!newUpdateText.trim()) {
                                                toast.error("Update text cannot be empty");
                                                return;
                                            }
                                            router.post(route('task.updates.store', currentTask?.id || task?.id), {
                                                update_text: newUpdateText,
                                            }, {
                                                preserveScroll: true,
                                                preserveState: true,
                                                onSuccess: () => {
                                                    toast.success("Update added successfully!");
                                                    setNewUpdateText("");
                                                    setShowAddUpdate(false);
                                                    // Reload task data
                                                    // Reload updates
                                                    fetch(route('task.show', currentTask?.id || task?.id))
                                                        .then(res => res.json())
                                                        .then(data => {
                                                            if (data.task) {
                                                                setCurrentTask(data.task);
                                                                setUpdates(data.task.updates || []);
                                                            }
                                                        })
                                                        .catch(() => { });
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
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {updates.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                                    No updates yet. Add an update to track task progress.
                                </p>
                            ) : (
                                updates.map((update) => (
                                    <div
                                        key={update.id}
                                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                                    >
                                        {editingUpdateId === update.id ? (
                                            <div className="space-y-2">
                                                <PrimaryInput
                                                    type="text"
                                                    value={editUpdateText}
                                                    onChange={(e) => setEditUpdateText(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <PrimaryButtonChildren
                                                        onClick={() => {
                                                            if (!editUpdateText.trim()) {
                                                                toast.error("Update text cannot be empty");
                                                                return;
                                                            }
                                                            router.patch(route('task.updates.update', [currentTask?.id || task?.id, update.id]), {
                                                                update_text: editUpdateText,
                                                            }, {
                                                                preserveScroll: true,
                                                                preserveState: true,
                                                                onSuccess: () => {
                                                                    toast.success("Update updated successfully!");
                                                                    setEditingUpdateId(null);
                                                                    setEditUpdateText("");
                                                                    // Reload updates
                                                                    fetch(route('task.show', currentTask?.id || task?.id))
                                                                        .then(res => res.json())
                                                                        .then(data => {
                                                                            if (data.task) {
                                                                                setCurrentTask(data.task);
                                                                                setUpdates(data.task.updates || []);
                                                                            }
                                                                        })
                                                                        .catch(() => { });
                                                                    router.reload({ only: ['taskAll', 'completed'] });
                                                                },
                                                                onError: (errors) => {
                                                                    const messages = Object.values(errors).flat().join(" ");
                                                                    toast.error(messages || "Something went wrong");
                                                                }
                                                            });
                                                        }}
                                                        className="py-2 px-2 text-xs"
                                                    >
                                                        Save Changes
                                                    </PrimaryButtonChildren>
                                                    <SecondaryButton
                                                        text="Cancel"
                                                        onClick={() => {
                                                            setEditingUpdateId(null);
                                                            setEditUpdateText("");
                                                        }}
                                                        className="py-2 px-2 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {update.update_text}
                                                </p>
                                                {isAdmin && (
                                                    <div className="flex">
                                                        <IconButton
                                                            icon={
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                                                </svg>
                                                            }
                                                            iconColor="blue-600"
                                                            variant="filled"
                                                            onClick={() => {
                                                                setEditingUpdateId(update.id);
                                                                setEditUpdateText(update.update_text);
                                                            }}
                                                            tooltip="Edit"
                                                            className="py-2 px-2 text-xs"
                                                        />

                                                        <IconButton
                                                            icon={
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9" />
                                                                </svg>
                                                            }
                                                            iconColor="destructive"
                                                            variant="filled"
                                                            onClick={() => {
                                                                if (!confirm("Are you sure you want to delete this update?")) return;
                                                                router.delete(route('task.updates.destroy', [currentTask?.id || task?.id, update.id]), {
                                                                    preserveScroll: true,
                                                                    preserveState: true,
                                                                    onSuccess: () => {
                                                                        toast.success("Update deleted successfully!");
                                                                        fetch(route('task.show', currentTask?.id || task?.id))
                                                                            .then(res => res.json())
                                                                            .then(data => {
                                                                                if (data.task) {
                                                                                    setCurrentTask(data.task);
                                                                                    setUpdates(data.task.updates || []);
                                                                                }
                                                                            });
                                                                        router.reload({ only: ['taskAll', 'completed'] });
                                                                    }
                                                                });
                                                            }}
                                                            tooltip="Delete"
                                                            className="p-2 text-xs"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
