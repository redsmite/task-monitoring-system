import { useState, useEffect } from 'react';
import { SelectItem } from "@/Components/ui/select";
import { toast } from 'sonner';
import PrimaryInput from '../Form/PrimaryInput';
import SelectInput from '../Form/SelectInput';
import PrimaryButton from '../Button/PrimaryButton';
import DivisionContainer from '../Misc/DivisionContainer';

export default function AssigneeDrawer({
    open,
    onClose,
    assignee,
    divisions_data = [],
    editData,
    setEditData,
    postEditData,
    editProcessing,
    resetEditData,
    editErrors,
    deleteAssignee,
    isAddMode = false,
    addData,
    setDataAdd,
    postAddData,
    addProcessing,
    resetAddData,
    addErrors
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

    // Helper function to initialize edit data from assignee
    const initializeEditData = () => {
        if (assignee && !isAddModeActive) {
            setEditData({
                first_name: assignee.first_name || '',
                last_name: assignee.last_name || '',
                position: assignee.position || '',
                division_id: assignee.division_id ? String(assignee.division_id) : '',
            });
        }
    }

    // Initialize edit data when assignee changes
    useEffect(() => {
        initializeEditData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignee, isAddModeActive]);

    // Re-initialize edit data when entering edit mode
    useEffect(() => {
        if (isEditMode && !isAddModeActive && assignee) {
            initializeEditData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode]);

    // Save Edit
    const saveEdit = () => {
        if (!assignee) return;

        postEditData(route('assignee.update', assignee.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success("Assignee updated successfully!");
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
        postAddData(route('assignee.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success("Assignee added successfully!");
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
        if (!assignee) return;
        if (!confirm("Are you sure you want to delete this assignee? Deleting assignees will also remove their tasks.")) return;

        toast.loading("Deleting assignee...");

        deleteAssignee(assignee.id);
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
                        {isAddModeActive ? 'Add New Assignee' : assignee ? `${assignee.first_name} ${assignee.last_name}` : 'Assignee Details'}
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
                                label="First Name"
                                placeholder="Enter first name"
                                value={currentData.first_name || ''}
                                onChange={(e) => updateFormData("first_name", e.target.value)}
                                error={currentErrors?.first_name}
                            />

                            <PrimaryInput
                                type="text"
                                label="Last Name"
                                placeholder="Enter last name"
                                value={currentData.last_name || ''}
                                onChange={(e) => updateFormData("last_name", e.target.value)}
                                error={currentErrors?.last_name}
                            />

                            <PrimaryInput
                                type="text"
                                label="Position"
                                placeholder="Enter position"
                                value={currentData.position || ''}
                                onChange={(e) => updateFormData("position", e.target.value)}
                                error={currentErrors?.position}
                            />

                            <SelectInput
                                label="Division"
                                placeholder="Select Division"
                                value={currentData.division_id}
                                onChange={(value) => updateFormData("division_id", value)}
                                error={currentErrors?.division_id}
                            >
                                {divisions_data.map((division) => (
                                    <SelectItem key={division.id} value={String(division.id)}>
                                        {division.division_name}
                                    </SelectItem>
                                ))}
                            </SelectInput>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <PrimaryButton
                                    text={isAddModeActive ? "Add Assignee" : "Save Changes"}
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
                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4">👤 Position</h4>
                                    <p className="text-gray-900 dark:text-white font-semibold text-sm">
                                        {assignee?.position || "No position set."}
                                    </p>
                                </div>

                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4">🔰 Division</h4>
                                    {assignee?.division ? (
                                        <DivisionContainer bgcolor={assignee.division.division_color}>
                                            {assignee.division.division_name}
                                        </DivisionContainer>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">No division assigned</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <PrimaryButton
                                    text="Edit Assignee"
                                    onClick={() => setIsEditMode(true)}
                                />
                                {assignee && (
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 bg-red-600 text-white text-sm py-2.5 px-4 rounded cursor-pointer hover:bg-red-700 transition duration-300 font-medium"
                                    >
                                        Delete Assignee
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

