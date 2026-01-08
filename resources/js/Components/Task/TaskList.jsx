import PriorityContainer from '../Misc/PriorityContainer';
import StatusContainer from '../Misc/StatusContainer';
import PrimaryButton from '../Button/PrimaryButton';
import Pagination from '../Misc/Pagination';

export default function TaskList({
    title,
    icon,
    borderColor,
    data = [],
    onTaskClick,
    onAddClick,
    showAddButton = true,
    paginationLinks = [],
    paginationCurrentPage,
    paginationPerPage,
    paginationTotal,
    paginationLastPage,
    tableType = ''
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
                    text="➕ Add Task"
                    onClick={onAddClick}
                />
            )}

            {/* Task List */}
            <div className="space-y-2">
                {data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No tasks found.
                    </div>
                ) : (
                    data.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => onTaskClick(task)}
                            className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors active:scale-[0.98]"
                        >
                            {/* Task Name */}
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white line-clamp-2">
                                {task.name}
                            </h3>

                            {/* Priority and Status */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                                    <PriorityContainer priority={task.priority}>
                                        {task.priority || 'No priority'}
                                    </PriorityContainer>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                                    <StatusContainer status={task.status}>
                                        {task.status}
                                    </StatusContainer>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Latest Update:</span>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                                        {task?.latest_update?.update_text || task?.last_action || 'No updates yet'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {paginationLinks && paginationLinks.length > 0 && (
                <div className="mt-4">
                    <Pagination
                        links={paginationLinks}
                        current_page={paginationCurrentPage}
                        per_page={paginationPerPage}
                        total={paginationTotal}
                        last_page={paginationLastPage}
                        tableType={tableType}
                    />
                </div>
            )}
        </div>
    );
}

