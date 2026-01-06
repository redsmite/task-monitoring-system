import DivisionContainer from '../Misc/DivisionContainer';
import PrimaryButton from '../Button/PrimaryButton';

export default function DivisionList({
    title,
    icon,
    borderColor,
    data = [],
    onDivisionClick,
    onAddClick,
    showAddButton = true
}) {
    return (
        <div className="rounded-lg p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    <h2 className="text-xl font-semibold">{title}</h2>
                </div>
            </div>

            {/* Add Button */}
            {showAddButton && (
                <PrimaryButton
                    text="➕ Add Division"
                    onClick={onAddClick}
                />
            )}

            {/* Division List */}
            <div className="space-y-2">
                {data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No divisions found.
                    </div>
                ) : (
                    data.map((division) => (
                        <div
                            key={division.id}
                            onClick={() => onDivisionClick(division)}
                            className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors active:scale-[0.98]"
                        >
                            {/* Division Name */}
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {division.division_name}
                                </h3>
                                <div
                                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                                    style={{ backgroundColor: division.division_color }}
                                />
                            </div>

                            {/* Preview */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Preview:</span>
                                <DivisionContainer bgcolor={division.division_color}>
                                    {division.division_name}
                                </DivisionContainer>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

