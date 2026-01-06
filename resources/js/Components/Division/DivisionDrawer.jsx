import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import PrimaryInput from '../Form/PrimaryInput';
import PrimaryButton from '../Button/PrimaryButton';
import DivisionContainer from '../Misc/DivisionContainer';

export default function DivisionDrawer({
    open,
    onClose,
    division,
    editData,
    setEditData,
    postEditData,
    editProcessing,
    resetEditData,
    editErrors,
    deleteDivision,
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

    // Helper function to initialize edit data from division
    const initializeEditData = () => {
        if (division && !isAddModeActive) {
            setEditData({
                division_name: division.division_name || '',
                division_color: division.division_color || '#FF6B6B',
            });
        }
    }

    // Initialize edit data when division changes
    useEffect(() => {
        initializeEditData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [division, isAddModeActive]);

    // Re-initialize edit data when entering edit mode
    useEffect(() => {
        if (isEditMode && !isAddModeActive && division) {
            initializeEditData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode]);

    // Save Edit
    const saveEdit = () => {
        if (!division) return;

        postEditData(route('division.update', division.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success("Division updated successfully!");
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
        postAddData(route('division.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success("Division added successfully!");
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
        if (!division) return;
        if (!confirm("Are you sure you want to delete this division?")) return;

        toast.loading("Deleting division...");

        deleteDivision(division.id);
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
                        {isAddModeActive ? 'Add New Division' : division ? division.division_name : 'Division Details'}
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
                                label="Division Name"
                                placeholder="Enter division name"
                                value={currentData.division_name || ''}
                                onChange={(e) => updateFormData("division_name", e.target.value)}
                                error={currentErrors?.division_name}
                            />

                            <div className="space-y-2">
                                <label className="text-black dark:text-white">Division Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={currentData.division_color || '#FF6B6B'}
                                        onChange={(e) => updateFormData("division_color", e.target.value)}
                                        className="h-10 w-20 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                                    />
                                    <input
                                        type="text"
                                        value={currentData.division_color || '#FF6B6B'}
                                        onChange={(e) => updateFormData("division_color", e.target.value)}
                                        placeholder="#FF6B6B"
                                        className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-black dark:border-stone-800 dark:text-white"
                                    />
                                </div>
                                {currentErrors?.division_color && (
                                    <p className="text-red-600 dark:text-red-500">{currentErrors.division_color}</p>
                                )}
                            </div>

                            {/* Color Preview */}
                            <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Preview</h4>
                                <DivisionContainer bgcolor={currentData.division_color || '#FF6B6B'}>
                                    {currentData.division_name || 'Division Name'}
                                </DivisionContainer>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <PrimaryButton
                                    text={isAddModeActive ? "Add Division" : "Save Changes"}
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
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4">🎨 Color</h4>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                                            style={{ backgroundColor: division?.division_color }}
                                        />
                                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                                            {division?.division_color || 'No color set'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4">Preview</h4>
                                    {division ? (
                                        <DivisionContainer bgcolor={division.division_color}>
                                            {division.division_name}
                                        </DivisionContainer>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">No preview available</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <PrimaryButton
                                    text="Edit Division"
                                    onClick={() => setIsEditMode(true)}
                                />
                                {division && (
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 bg-red-600 text-white text-sm py-2.5 px-4 rounded cursor-pointer hover:bg-red-700 transition duration-300 font-medium"
                                    >
                                        Delete Division
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

