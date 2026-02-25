import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import PrimaryInput from "../Form/PrimaryInput";
import SelectInput from "../Form/SelectInput";
import MultiSelectInput from "../Form/MultiSelectInput";
import Datepicker from "../Form/Datepicker";
import { SelectItem } from "@/Components/ui/select";
import IconButton from "../Button/IconButton";

export default function TaskAddModal({
    isOpen,
    onClose,
    addData,
    updateAddTaskData,
    saveAdd,
    addProcessing,
    users_data,
    divisions_data,
    tableType,
    preselectStatus,
    formatDateToSave,
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl">
                
                {/* Header */}
                <div className="px-8 py-6 bg-blue-500">
                    <DialogTitle className="text-2xl font-semibold text-white">
                        Create New Task
                    </DialogTitle>
                    <p className="text-sm text-white mt-1">
                        Fill in the task details below
                    </p>
                </div>

                {/* Body */}
                <div className="px-8 py-8 space-y-8 max-h-[70vh] overflow-y-auto">

                    {/* BASIC INFO */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Task Name
                                </label>
                                <PrimaryInput
                                    type="text"
                                    placeholder="Enter task name"
                                    value={addData.task_name || ""}
                                    onChange={(e) =>
                                        updateAddTaskData("task_name", e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Last Action
                                </label>
                                <PrimaryInput
                                    type="text"
                                    placeholder="Enter last action"
                                    value={addData.last_action || ""}
                                    onChange={(e) =>
                                        updateAddTaskData("last_action", e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* ASSIGNMENT */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            Assignment
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Assignee
                                </label>
                                <MultiSelectInput
                                    placeholder="Select assignee"
                                    options={users_data.map(user => ({
                                        ...user,
                                        name: `${user.last_name}, ${user.first_name}`
                                    }))}
                                    value={Array.isArray(addData.assignee) ? addData.assignee : []}
                                    onChange={(selectedUserIds) => {
                                        updateAddTaskData("assignee", selectedUserIds);

                                        const selectedUsers = users_data.filter(user =>
                                            selectedUserIds.includes(String(user.id))
                                        );

                                        const divisionIds = [
                                            ...new Set(
                                                selectedUsers
                                                    .map(user => user.division_id)
                                                    .filter(Boolean)
                                            )
                                        ];

                                        updateAddTaskData("division", divisionIds);
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Division
                                </label>
                                <div className="h-10 flex items-center px-3 rounded-md bg-gray-50 border text-sm text-gray-600">
                                    {Array.isArray(addData.division) && addData.division.length > 0
                                        ? divisions_data
                                            .filter(div =>
                                                addData.division.map(Number).includes(div.id)
                                            )
                                            .map(div => div.division_name)
                                            .join(", ")
                                        : "Auto-generated from assignee"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STATUS & DATES */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            Status & Timeline
                        </h3>

                        <div className="grid grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <SelectInput
                                    value={
                                        addData.status ||
                                        preselectStatus(tableType) ||
                                        ""
                                    }
                                    onChange={(value) =>
                                        updateAddTaskData("status", value)
                                    }
                                >
                                    <SelectItem value="not_started">
                                        Not Started
                                    </SelectItem>
                                    <SelectItem value="in_progress">
                                        In Progress
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completed
                                    </SelectItem>
                                </SelectInput>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Priority
                                </label>
                                <SelectInput
                                    value={addData.priority || ""}
                                    onChange={(value) =>
                                        updateAddTaskData("priority", value)
                                    }
                                >
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                    <SelectItem value="Regular">Regular</SelectItem>
                                </SelectInput>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Date Instructed
                                </label>
                                <Datepicker
                                    value={addData.created_at}
                                    onChange={(date) =>
                                        updateAddTaskData(
                                            "created_at",
                                            formatDateToSave(date)
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Due Date
                                </label>
                                <Datepicker
                                    value={addData.due_date}
                                    onChange={(date) =>
                                        updateAddTaskData(
                                            "due_date",
                                            formatDateToSave(date)
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-8 py-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={saveAdd}
                        disabled={addProcessing}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {addProcessing ? "Saving..." : "Save Task"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}