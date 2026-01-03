import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { toast } from 'sonner';
import StatusContainer from "./Misc/StatusContainer";
import PriorityContainer from "./Misc/PriorityContainer";
import DivisionContainer from "./Misc/DivisionContainer";
import DateContainer from "./Misc/DateContainer";

export default function Sidebar({ open, onClose, task }) {

    // Description
    const [editDescriptionId, setEditDescriptionId] = useState(null);
    const [descriptionValue, setDescriptionValue] = useState(task?.description || "");

    // Sync descriptionValue with task prop when task changes
    useEffect(() => {
        setDescriptionValue(task?.description || "");
    }, [task?.description]);

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
                className={`fixed top-0 right-0 h-full w-160 bg-white dark:bg-stone-800 shadow-lg z-100
                    transform transition-transform duration-300 ease-in-out
                    ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="p-4 flex justify-between items-center border-b">
                    <button onClick={onClose}>✕</button>
                </div>

                <div className="p-4 space-y-6">
                    <div className="flex justify-end gap-4">
                        <StatusContainer
                            status={task?.status}
                        >
                            {task?.status}
                        </StatusContainer>
                        <PriorityContainer
                            priority={task?.priority ? task?.priority : ''}
                        >
                            {task?.priority ? task?.priority : "No priority set."}
                        </PriorityContainer>
                    </div>

                    <h1 className="text-3xl font-semibold">{task?.name}</h1>

                    <div className="grid grid-cols-3 border border-gray-300 rounded overflow-hidden">
                        <div
                            onClick={() => ToggleDescriptionEdit(task)}
                            className="group relative min-h-48 col-span-3 p-3 border-b border-gray-300 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
                        >
                            {editDescriptionId === task?.id ? (
                                <textarea
                                    value={descriptionValue}
                                    onChange={(e) => setDescriptionValue(e.target.value)}
                                    className="w-full h-full text-sm border rounded p-2"
                                    onBlur={() => saveDescription(task?.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                    maxLength={200}
                                />
                            ) : (
                                <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold italic max-w-full break-words">
                                    {descriptionValue ? descriptionValue : "No description."}
                                </p>
                            )}

                            {editDescriptionId != task?.id && (
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition flex items-end justify-end p-2">
                                    <span className="text-xs text-gray-600 bg-white dark:text-white dark:bg-stone-800 px-2 py-1 rounded shadow">
                                        ✏️ Edit Description
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="min-h-44 p-3 flex flex-col border-r border-gray-300">
                            <div className="flex justify-center">
                                <h1 className="text-md font-semibold">📅Due Date</h1>
                            </div>
                            <div className="flex flex-1 justify-center items-center">
                                <DateContainer
                                    bgcolor="bg-red-100"
                                >
                                    {task?.due_date ? `${task.due_date}` : "No due date set."}
                                </DateContainer>
                            </div>
                        </div>

                        <div className="min-h-44 p-3 flex flex-col border-r border-gray-300">
                            <div className="flex justify-center">
                                <h1 className="text-md font-semibold">👤Assigned To</h1>
                            </div>
                            <div className="flex flex-1 justify-center items-center">
                                <p className="text-violet-500 font-semibold">{task?.employee?.first_name} {task?.employee?.last_name}</p>
                            </div>
                        </div>

                        <div className="min-h-44 p-3 flex flex-col">
                            <div className="flex justify-center">
                                <h1 className="text-md font-semibold">🔰Division</h1>
                            </div>
                            <div className="flex flex-1 justify-center items-center">
                                <div>
                                    <DivisionContainer
                                        bgcolor={task?.division?.division_color}
                                    >
                                        {task?.division?.division_name}
                                    </DivisionContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold">Last Action</h1>
                        <p>{task?.last_action ? task?.last_action : "No last action."}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
