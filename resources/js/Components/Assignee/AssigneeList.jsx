import DivisionContainer from '../Misc/DivisionContainer';
import PrimaryButton from '../Button/PrimaryButton';

export default function AssigneeList({
    title,
    icon,
    borderColor,
    data = [],
    onAssigneeClick,
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
                    text="➕ Add Assignee"
                    onClick={onAddClick}
                />
            )}

            {/* Assignee List */}
            <div className="space-y-2">
                {data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No assignees found.
                    </div>
                ) : (
                    data.map((assignee) => (
                        <div
                            key={assignee.id}
                            onClick={() => onAssigneeClick(assignee)}
                            className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors active:scale-[0.98]"
                        >
                            {/* Name */}
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                                {assignee.first_name} {assignee.last_name}
                            </h3>

                            {/* Position and Division */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Position:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {assignee.position || 'No position'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Division:</span>
                                    {assignee.division ? (
                                        <DivisionContainer bgcolor={assignee.division.division_color}>
                                            {assignee.division.division_name}
                                        </DivisionContainer>
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

