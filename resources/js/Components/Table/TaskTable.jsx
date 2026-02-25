import { useState, useEffect, useRef } from 'react'
import { router } from "@inertiajs/react";
import { SelectItem } from "@/Components/ui/select"
import { toast } from 'sonner';
import TableContainer from "../DivContainer/TableContainer";
import Table from "./Table";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TableData from "./TableData";
import DivisionContainer from '../Misc/DivisionContainer';
import Pagination from "../Misc/Pagination";
import PrimaryInput from "../Form/PrimaryInput";
import SelectInput from "../Form/SelectInput";
import MultiSelectInput from "../Form/MultiSelectInput";
import Datepicker from '../Form/Datepicker';
import IconButton from '../Button/IconButton';
import { format, parse } from 'date-fns';
import DateContainer from '../Misc/DateContainer';
import StatusContainer from '../Misc/StatusContainer';
import PriorityContainer from '../Misc/PriorityContainer';
import ActionData from './ActionData';
import ActionHeader from './ActionHeader';
import TaskAddModal from "../Task/TaskAddModal";

export default function TaskTable({
    borderColor = "border-blue-500",
    tableIcon = "icon",
    tableTitle = "tableTitle",
    data,
    users_data,
    divisions_data,
    paginationLinks = [],
    paginationCurrentPage,
    paginationPerPage,
    paginationTotal,
    paginationLastPage,
    tableType,
    addData,
    setDataAdd,
    postAddData,
    addProcessing,
    resetAddData,
    addErrors,
    editData,
    setEditData,
    postEditData,
    editProcessing,
    resetEditData,
    editErrors,
    deleteTask,
    onRowClick,
    userRole = 'user',
}) {
    // Check if admin
    const isAdmin = ['ored', 'ms', 'ts'].includes(userRole);
    // Search/Pagination/Ordering/URL //
    // Url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Url Parms
    let search = urlParams.get(`${tableType}_search`) || '';
    let sort = urlParams.get(`${tableType}_sort`) || 'desc';
    let page = urlParams.get(`${tableType}_page`) || 1;
    let statusFilter = urlParams.get(`${tableType}_status`) || '';

    // Clean Sort Value
    if (sort !== 'asc' && sort !== 'desc') {
        sort = 'desc';
    }

    // Clean Status Filter Value (only for task_all)
    if (tableType === 'task_all' && statusFilter !== '' && statusFilter !== 'all' && statusFilter !== 'in_progress' && statusFilter !== 'not_started') {
        statusFilter = 'all';
    }

    // Default to 'all' if empty for task_all
    if (tableType === 'task_all' && statusFilter === '') {
        statusFilter = 'all';
    }

    // State
    const [searchValues, setSearchValues] = useState(search || '');
    const [sortValues, setSortValues] = useState(sort || 'desc');
    const [pageValues, setPageValues] = useState(page || 1);
    const [statusFilterValue, setStatusFilterValue] = useState(statusFilter || (tableType === 'task_all' ? 'all' : ''));
    const isInitialMount = useRef(true);

    // Set
    const handleSearchChange = (value) => {
        setSearchValues(value);
        setPageValues(1);
    }

    const handleSortChange = (value) => {
        setSortValues(value);
    }

    const handleStatusFilterChange = (value) => {
        setStatusFilterValue(value);
        setPageValues(1);
    }

    // Effects
    useEffect(() => {
        const sortParam = `${tableType}_sort`;
        const searchParam = `${tableType}_search`;
        const pageParam = `${tableType}_page`;
        const statusParam = `${tableType}_status`;

        const currentParams = Object.fromEntries(
            new URLSearchParams(window.location.search)
        );

        // Check if this table's params already exist and match current state
        const existingSort = currentParams[sortParam];
        const existingSearch = currentParams[searchParam];
        const existingPage = currentParams[pageParam];
        const existingStatus = currentParams[statusParam];

        // On initial mount, handle the empty URL case
        if (isInitialMount.current) {
            isInitialMount.current = false;

            // If all params for this table already exist and match, skip update
            const normalizedStatusFilter = (statusFilterValue === 'all' || !statusFilterValue) ? '' : statusFilterValue;
            const normalizedExistingStatus = existingStatus || '';

            if (existingSort === String(sortValues) &&
                existingSearch === String(searchValues) &&
                existingPage === String(pageValues) &&
                (tableType !== 'task_all' || normalizedExistingStatus === normalizedStatusFilter)) {
                return; // Params already match, no need to update
            }

            // Each table adds a small delay based on its type to ensure params are added sequentially
            const urlIsEmpty = Object.keys(currentParams).length === 0;
            if (urlIsEmpty) {
                const tableOrder = { 'task_all': 0, 'not_started': 1, 'in_progress': 2, 'completed': 3 };
                const delay = (tableOrder[tableType] || 0) * 10; // 10ms stagger between tables

                setTimeout(() => {
                    // Re-read URL params after previous tables may have initialized
                    const latestParams = Object.fromEntries(
                        new URLSearchParams(window.location.search)
                    );

                    const searchUrl = {
                        ...latestParams,
                        [sortParam]: sortValues,
                        [searchParam]: searchValues,
                        [pageParam]: pageValues,
                    };

                    // Only add status filter for task_all (skip if 'all')
                    if (tableType === 'task_all' && statusFilterValue && statusFilterValue !== 'all') {
                        searchUrl[statusParam] = statusFilterValue;
                    }

                    router.get(route('task.index'), searchUrl, {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true
                    });
                }, delay);
                return;
            }
        }

        // Check if update is needed (params missing or different)
        const sortChanged = existingSort !== String(sortValues);
        const searchChanged = existingSearch !== String(searchValues);
        const pageChanged = existingPage !== String(pageValues);

        // Normalize status: 'all' means no param in URL (undefined/empty)
        const normalizedStatusFilter = (statusFilterValue === 'all' || !statusFilterValue) ? '' : statusFilterValue;
        const normalizedExistingStatus = existingStatus || '';
        const statusChanged = tableType === 'task_all' && normalizedExistingStatus !== normalizedStatusFilter;

        // Only update if something changed
        if (!sortChanged && !searchChanged && !pageChanged && !statusChanged) {
            return;
        }

        // When sorting or filtering changes, preserve current page from URL if available
        const pageToUse = existingPage || pageValues;

        const searchUrl = {
            ...currentParams,
            [sortParam]: sortValues,
            [searchParam]: searchValues,
            [pageParam]: pageToUse,
        }

        // Only add status filter for task_all (skip if 'all')
        if (tableType === 'task_all') {
            if (statusFilterValue && statusFilterValue !== 'all') {
                searchUrl[statusParam] = statusFilterValue;
            } else {
                // Remove status param if 'all' or empty
                delete searchUrl[statusParam];
            }
        }

        router.get(route('task.index'), searchUrl, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        })
    }, [sortValues, searchValues, pageValues, statusFilterValue, tableType]);

    // Table Adding //
    // State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Ensure only one TaskTable add row is open at a time across the page
    // useEffect(() => {
    //     const handleAddToggle = (event) => {
    //         const activeTable = event.detail?.tableType || null;
    //         if (activeTable !== tableType) {
    //             setIsAddActive(null);
    //         }
    //     };

    //     window.addEventListener('task-table-add-toggle', handleAddToggle);
    //     return () => window.removeEventListener('task-table-add-toggle', handleAddToggle);
    // }, [tableType]);

    // Set
    const openAddModal = () => {
        resetAddData();

        if (!addData.status) {
            setDataAdd((data) => ({
                ...data,
                status: preselectStatus(tableType),
            }));
        }

        setIsAddModalOpen(true);
    };

const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetAddData();
};

    // Add
    const updateAddTaskData = (field, value) => {
        // If assignee/division, map to string IDs
        if (field === "assignee" || field === "division") {
            const normalized = value.map(v => String(v));
            setDataAdd((data) => ({ ...data, [field]: normalized }));
        } else {
            setDataAdd((data) => ({ ...data, [field]: value }));
        }
    };

    // Save Add
    const saveAdd = () => {
        postAddData(route('task.store'), {
            method: 'post',
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success("Task added successfully!");
                ToggleAdd()
                resetAddData();
            },
            onError: (errors) => {
                const messages = Object.values(errors).flat().join(" ");
                toast.error(messages || "Something went wrong");
            }
        });
    }

    // Preselect Status
    const preselectStatus = (tableType) => {
        if (tableType === "not_started") {
            return "not_started";
        }
        if (tableType === "in_progress") {
            return "in_progress";
        }
        if (tableType === "completed") {
            return "completed";
        }
    }

    // Table Editing //
    // State
    const [isEditActive, setIsEditActive] = useState({});

    // Set
    const getDivisionIdsFromAssignees = (assigneeIds) => {
        const selectedUsers = users_data.filter(user =>
            assigneeIds.includes(String(user.id))
        );

        return [
            ...new Set(
                selectedUsers
                    .map(user => user.division_id)
                    .filter(Boolean)
                    .map(String)
            )
        ];
    };
    const ToggleEdit = (task) => {
        setIsEditActive((prev) => {
            const next = { [task.id]: !prev[task.id] };

            // Assignees
            const assigneeIds = task.users?.length
                ? task.users.map(u => String(u.id))
                : [];

            // Calculate divisions based on assignees immediately
            const divisionIds = getDivisionIdsFromAssignees(assigneeIds).map(String);

            setEditData({
                task_name: task.name || '',
                assignee: assigneeIds,
                division: divisionIds,   // ✅ divisions are prefilled
                last_action: task.latest_update?.update_text || task.last_action || '',
                status: formatStatusToDb(task.status) || '',
                priority: formatPriorityToDb(task.priority) || '',
                created_at: task.created_at || '',
                due_date: task.due_date || '',
                description: task.description || '',
            });

            return next;
        });
    };


    // Edit
    // useForm setData is async; use the callback form to avoid stale reads
    const updateEditTaskData = (field, value) => {
        setEditData((data) => ({
            ...data,
            [field]: value,
        }));
    }

    // Save Edit
    const saveEdit = (taskId) => {
        postEditData(route('task.update', taskId), {
            method: 'patch', // or 'patch'
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success("Task updated successfully!");
                setIsEditActive((prev) => ({ ...prev, [taskId]: false }));
                resetEditData();
            },
            onError: (errors) => {
                const messages = Object.values(errors).flat().join(" ");
                toast.error(messages || "Something went wrong.");
            },
        });
    }


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
            'Urgent': 'Urgent',
            'Regular': 'Regular',
        }
        return map[value] || value;
    }

    const formatDateToSave = (value) => {
        const date = value instanceof Date ? value : new Date(value);
        return format(date, 'yyyy-MM-dd');
    }

    // Check if task is overdue
    const isTaskOverdue = (dueDate) => {
        if (!dueDate) return false;

        try {
            // Parse the date from "m/d/Y" format
            const parsedDate = parse(dueDate, 'MM/dd/yyyy', new Date());

            // Check if parsing was successful
            if (isNaN(parsedDate.getTime())) {
                return false;
            }

            // Get today's date at midnight for comparison
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Set the parsed date to midnight for accurate comparison
            parsedDate.setHours(0, 0, 0, 0);

            // Return true if due date is before today
            return parsedDate < today;
        } catch (error) {
            return false;
        }
    }

    const getOfficeBadgeStyle = (office) => {
        if (!office) return "";

        const normalized = office.toLowerCase().trim();

        switch (normalized) {
            case 'ored':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100';

            case 'ms':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';

            case 'ts':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';

            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    const getOfficeFullName = (office) => {
        if (!office) return "";

        const officeMap = {
            ored: "Regional Executive Director",
            ms: "Assistant Regional Director for Management Services",
            ts: "Assistant Regional Director for Technical Services",
        };

        return officeMap[office.toLowerCase()] || office;
    };

    const canModifyTask = (task) => {
        if (!task?.originating_office) return false;

        return task.originating_office === userRole;
    };
    const canShowAddButton = () => {
        if (!isAdmin) return false;

        if (!userRole) return false;

        if (tableType === 'task_all') return true;

        return tableType === userRole;
    };

    // Formatting for displaying the add button
    // Sorting value
    const formattedSortValue = (sortValue) => {
        const formattedValue = tableType + '_' + sortValue;
        return formattedValue;
    }

    // Last Page value 
    const formattedLastPageValue = (lastPageValue) => {
        const formattedValue = tableType + '_page=' + lastPageValue;
        return formattedValue;
    }
    const HEADER_CONTENT = (
        <div className="flex gap-4">
            <PrimaryInput
                type="text"
                placeholder="Search Task, Assignee, Division, Last Action..."
                value={searchValues}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 w-[22rem]"
            />
            {tableType === 'task_all' && (
                <SelectInput
                    placeholder="Filter by Status"
                    value={statusFilterValue || 'all'}
                    onChange={(value) => handleStatusFilterChange(value)}
                >
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                </SelectInput>
            )}
            <SelectInput
                placeholder="Sort Order"
                value={sortValues || ''}
                onChange={(value) => handleSortChange(value)}
            >
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
            </SelectInput>
        </div>
    )

    const THEAD_CONTENT = (
        <tr className="divide-x divide-gray-300 dark:divide-gray-700">
            <TableHeader>
                Task
            </TableHeader>
            <TableHeader>
                Assignee
            </TableHeader>
            <TableHeader>
                Division
            </TableHeader>
            <TableHeader>
                Last Action
            </TableHeader>
            <TableHeader>
                Status
            </TableHeader>
            <TableHeader>
                Date Instructed
            </TableHeader>
            <TableHeader>
                Due Date
            </TableHeader>
            <TableHeader>
                Priority
            </TableHeader>
            <ActionHeader>
                Action
            </ActionHeader>
        </tr>
    )

    const TBODY_CONTENT = (
        <>
            {data.length === 0 &&
                (
                    <TableRow>
                        <TableData colSpan={8} className="text-center">
                            No tasks found.
                        </TableData>
                    </TableRow>
                )
            }

            {formattedSortValue(sortValues) === tableType + '_' + 'desc' && tableType + '_page=1' === tableType + '_page=' + page && (
                <>
                    {/* {canShowAddButton() && !isAddActive && (
                        <TableRow
                            onClick={() => ToggleAdd(tableType)}
                        >
                            <TableData
                                colSpan="9"
                                className="cursor-pointer"
                            >
                                ➕ Add Task
                            </TableData>
                        </TableRow>
                    )} */}

                    {/* {isAddActive && (
                        <TableRow>
                            <TableData
                                customWidth="min-w-[210px] max-w-[210px]"
                            >
                                <PrimaryInput
                                    type="text"
                                    placeholder="Task"
                                    value={addData.task_name}
                                    onChange={(e) => updateAddTaskData("task_name", e.target.value)}
                                    className={editErrors?.task_name ? `border border-red-500` : ``}
                                />

                            </TableData>
                            <TableData>
                                <MultiSelectInput
                                    label="Assignee"
                                    placeholder="Select Assignee"
                                    options={users_data.map(user => ({
                                        ...user,
                                        name: `${user.last_name}, ${user.first_name}` // override name for display
                                    }))}
                                    value={Array.isArray(addData.assignee) ? addData.assignee : []}
                                    onChange={(selectedUserIds) => {
                                        // Update assignees
                                        updateAddTaskData("assignee", selectedUserIds);

                                        // Get selected users
                                        const selectedUsers = users_data.filter(user =>
                                            selectedUserIds.includes(String(user.id))
                                        );

                                        // Extract unique divisions
                                        const divisionIds = [
                                            ...new Set(
                                                selectedUsers
                                                    .map(user => user.division_id)
                                                    .filter(Boolean)
                                            )
                                        ];

                                        // Update division array in addData for saving later
                                        updateAddTaskData("division", divisionIds);
                                    }}
                                />
                            </TableData>
                            <TableData>
                                <div className="text-sm font-medium text-gray-700">
                                    {Array.isArray(addData.division) && addData.division.length > 0
                                        ? divisions_data
                                            .filter(div => addData.division.map(Number).includes(div.id))
                                            .map(div => div.division_name)
                                            .join(", ")
                                        : "No division selected"}
                                </div>
                            </TableData>

                            <TableData>
                                <PrimaryInput
                                    type="text"
                                    placeholder="Last Action"
                                    value={addData.last_action}
                                    onChange={(e) => updateAddTaskData("last_action", e.target.value)}
                                />
                            </TableData>
                            <TableData>
                                <SelectInput
                                    placeholder="Select Status"
                                    value={addData.status || preselectStatus(tableType) || ''}
                                    onChange={(value) => updateAddTaskData("status", value)}
                                >
                                    <SelectItem value="not_started">Not Started</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>

                                </SelectInput>
                            </TableData>
                            <TableData>
                                <Datepicker
                                    value={addData.created_at}
                                    onChange={(date) =>
                                        updateAddTaskData("created_at", formatDateToSave(date))
                                    }
                                />
                            </TableData>
                            <TableData>
                                <Datepicker
                                    value={addData.due_date}
                                    onChange={(date) =>
                                        updateAddTaskData("due_date", formatDateToSave(date))
                                    }
                                />
                            </TableData>

                            <TableData>
                                <SelectInput
                                    placeholder="Select Priority"
                                    value={addData.priority || ''}
                                    onChange={(value) => updateAddTaskData("priority", value)}
                                >
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                    <SelectItem value="Regular">Regular</SelectItem>
                                </SelectInput>
                            </TableData>
                            {isAddActive && (
                                <ActionData>
                                    <div className="flex items-center gap-3">
                                        <IconButton
                                            onClick={() => saveAdd()}
                                            iconColor="green-600"
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                            }
                                        />
                                        <IconButton
                                            onClick={() => ToggleAdd()}
                                            iconColor="red-600"
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                            }
                                        />
                                    </div>
                                </ActionData>
                            )}
                        </TableRow>

                    )} */}
                </>
            )}

            {data.map(task => {
                // Only apply overdue highlighting for task_all table, not completed
                const isOverdue = tableType === 'task_all' ? isTaskOverdue(task?.due_date) : false;
                const rowClassName = isEditActive[task.id]
                    ? (isOverdue ? 'bg-red-100 dark:bg-red-900/20' : '')
                    : (isOverdue ? 'bg-red-100 dark:bg-red-900/20 cursor-pointer' : 'cursor-pointer');

                return (
                    <TableRow
                        key={task.id}
                        onClick={isEditActive[task.id] ? undefined : () => onRowClick(task)}
                        className={rowClassName}
                    >
                        {!isEditActive[task.id] && (
                            <>
                                <TableData customWidth="min-w-[210px] max-w-[210px]">
                                    <div className="flex items-center gap-2 flex-wrap">

                                        {/* Task Name */}
                                        <span>{task?.name}</span>

                                        {/* Office Badge */}
                                        {task?.originating_office && (
                                            <span
                                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getOfficeBadgeStyle(task.originating_office)}`}
                                            >
                                                {getOfficeFullName(task.originating_office)}
                                            </span>
                                        )}

                                    </div>
                                </TableData>
                                <TableData className="text-center">
                                    <div className="flex flex-wrap gap-1 sm:gap-2 justify-center items-center">

                                        {task?.users?.length > 0 ? (
                                            task.users.map((u) => (
                                                <DivisionContainer
                                                    key={u.id}
                                                    bgcolor={u.division?.division_color || "#6b7280"}
                                                    compact={task.users.length > 2}
                                                >
                                                    {u.first_name} {u.last_name}
                                                </DivisionContainer>
                                            ))
                                        ) : (
                                            <span className="text-gray-400">Unassigned</span>
                                        )}

                                    </div>
                                </TableData>

                                <TableData
                                    className="text-center"
                                >
                                    <div className="flex flex-wrap gap-1 sm:gap-2 justify-center items-center">
                                        {task?.divisions && task.divisions.length > 0 ? (
                                            task.divisions.map((division) => (
                                                <DivisionContainer
                                                    key={division.id}
                                                    bgcolor={division.division_color}
                                                    compact={task.divisions.length > 2}
                                                >
                                                    {division.division_name}
                                                </DivisionContainer>
                                            ))
                                        ) : task?.division ? (
                                            <DivisionContainer
                                                bgcolor={task.division.division_color}
                                            >
                                                {task.division.division_name}
                                            </DivisionContainer>
                                        ) : null}
                                    </div>
                                </TableData>
                                <TableData>
                                    {task?.latest_update?.update_text || task?.last_action || ''}
                                </TableData>
                                <TableData
                                    className={`text-center font-semibold text-md ${task?.status === 'Not Started'
                                        ? 'bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                                        : task?.status === 'In Progress'
                                            ? 'bg-orange-200 text-amber-900 dark:bg-amber-700 dark:text-amber-100'
                                            : task?.status === 'Completed'
                                                ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-700 dark:text-emerald-100'
                                                : ''
                                        }`
                                    }
                                >
                                    {task?.status}

                                </TableData>
                                <TableData
                                    className="text-center"
                                >
                                    <DateContainer
                                        bgcolor="bg-blue-200"
                                        textColor="text-blue-900"
                                    >
                                        {task?.created_at || 'N/A'}
                                    </DateContainer>
                                </TableData>
                                <TableData
                                    className="text-center"
                                >
                                    <DateContainer
                                        bgcolor="bg-red-200"
                                    >
                                        {task?.due_date}
                                    </DateContainer>
                                </TableData>
                                <TableData>
                                    <PriorityContainer
                                        priority={task?.priority}
                                    >
                                        {task?.priority}
                                    </PriorityContainer>
                                </TableData>
                            </>
                        )}

                        {isEditActive[task.id] && (
                            <>
                                <TableData>
                                    <PrimaryInput
                                        type="text"
                                        value={editData?.task_name ?? ''}
                                        onChange={(e) => updateEditTaskData("task_name", e.target.value)}
                                        className={editErrors?.task_name ? `border border-red-500` : ``}
                                    />

                                </TableData>
                                <TableData>
                                    <MultiSelectInput
                                        label="Assignee"
                                        placeholder="Select Assignee"
                                        options={users_data.map(user => ({
                                            ...user,
                                            name: `${user.last_name}, ${user.first_name}` // display as Last, First
                                        }))}
                                        value={Array.isArray(editData.assignee) ? editData.assignee : []}
                                        onChange={(selectedUserIds) => {
                                            // Update assignees
                                            updateEditTaskData("assignee", selectedUserIds);

                                            // Filter selected users by string IDs
                                            const selectedUsers = users_data.filter(user =>
                                                selectedUserIds.includes(String(user.id))
                                            );

                                            // Extract unique division IDs
                                            const divisionIds = [
                                                ...new Set(
                                                    selectedUsers
                                                        .map(user => user.division_id)
                                                        .filter(Boolean)
                                                )
                                            ];

                                            // Update divisions in editData
                                            updateEditTaskData("division", divisionIds);
                                        }}
                                    />
                                </TableData>
                                <TableData>
                                    <div className="text-sm font-medium text-gray-700">
                                        {Array.isArray(editData.division) && editData.division.length > 0
                                            ? divisions_data
                                                .filter(div => editData.division.map(String).includes(String(div.id)))
                                                .map(div => div.division_name)
                                                .join(", ")
                                            : "No division selected"}
                                    </div>
                                </TableData>
                                <TableData>
                                    <PrimaryInput
                                        type="text"
                                        value={editData?.last_action ?? ''}
                                        onChange={(e) => updateEditTaskData("last_action", e.target.value)}
                                    />
                                </TableData>
                                <TableData>
                                    <SelectInput
                                        placeholder="Select Status"
                                        value={editData?.status || formatStatusToDb(task?.status) || ''}
                                        onChange={(value) => updateEditTaskData("status", value)}
                                    >
                                        <SelectItem value="not_started">Not Started</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>

                                    </SelectInput>
                                </TableData>
                                <TableData className="text-center">
                                    <Datepicker
                                        value={editData?.created_at || task?.created_at || ''}
                                        onChange={(date) =>
                                            updateEditTaskData("created_at", formatDateToSave(date))
                                        }
                                    />
                                </TableData>

                                <TableData>
                                    <Datepicker
                                        value={editData?.due_date || task?.due_date || ''}
                                        onChange={(date) =>
                                            updateEditTaskData("due_date", formatDateToSave(date))
                                        }
                                    />
                                </TableData>
                                <TableData>
                                    <SelectInput
                                        placeholder="Select Priority"
                                        value={editData?.priority || formatPriorityToDb(task?.priority) || ''}
                                        onChange={(value) => updateEditTaskData("priority", value)}
                                    >
                                        <SelectItem value="Urgent">Urgent</SelectItem>
                                        <SelectItem value="Regular">Regular</SelectItem>
                                    </SelectInput>
                                </TableData>
                            </>
                        )}

                        <ActionData>
                            {!isEditActive[task.id] && isAdmin && canModifyTask(task) && (
                                <div className="flex items-center gap-3">
                                    <IconButton
                                        tooltip="Edit Task"
                                        onClick={() => ToggleEdit(task)}
                                        isDisabled={editProcessing}
                                        iconColor="blue-600"
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                        }
                                    />
                                    <IconButton
                                        tooltip="Delete Task"
                                        onClick={() => deleteTask(task.id)}
                                        isDisabled={editProcessing}
                                        iconColor="red-600"
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        }
                                    />
                                </div>
                            )}

                            {isEditActive[task.id] && (
                                <div className="flex items-center gap-3">
                                    <IconButton
                                        tooltip="Save Changes"
                                        onClick={() => saveEdit(task.id)}
                                        iconColor="green-600"
                                        isDisabled={editProcessing}
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        }
                                    />
                                    <IconButton
                                        tooltip="Cancel Edit"
                                        onClick={() => ToggleEdit(task)}
                                        iconColor="red-600"
                                        isDisabled={editProcessing}
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        }
                                    />
                                </div>
                            )}
                        </ActionData>
                    </TableRow>
                );
            })}

            {formattedSortValue(sortValues) === tableType + '_' + 'asc' && formattedLastPageValue(paginationLastPage) === tableType + '_page=' + page && (
                <>
                    {/* {canShowAddButton() && !isAddActive && (
                        <TableRow
                            onClick={() => ToggleAdd(tableType)}
                        >
                            <TableData
                                colSpan="9"
                                className="cursor-pointer"
                            >
                                ➕ Add Task
                            </TableData>
                        </TableRow>
                    )} */}

                    {isAddActive && (
                        <TableRow>
                            <TableData
                                customWidth="min-w-[210px] max-w-[210px]"
                            >
                                <PrimaryInput
                                    type="text"
                                    placeholder="Task"
                                    value={addData.task_name}
                                    onChange={(e) => updateAddTaskData("task_name", e.target.value)}
                                    className={editErrors?.task_name ? `border border-red-500` : ``}
                                />

                            </TableData>
                            <TableData>
                                <MultiSelectInput
                                    label="Assignee"
                                    placeholder="Select Assignee"
                                    options={users_data.map(user => ({
                                        ...user,
                                        name: `${user.last_name}, ${user.first_name}` // display as Last, First
                                    }))}
                                    value={Array.isArray(editData.assignee) ? editData.assignee : []}
                                    onChange={(selectedUserIds) => {
                                        // Update assignees
                                        updateEditTaskData("assignee", selectedUserIds);

                                        // Filter selected users
                                        const selectedUsers = users_data.filter(user =>
                                            selectedUserIds.includes(String(user.id))
                                        );

                                        // Auto-select divisions
                                        const divisionIds = [
                                            ...new Set(
                                                selectedUsers
                                                    .map(user => String(user.division_id)) // always string
                                                    .filter(Boolean)
                                            )
                                        ];

                                        updateEditTaskData("division", divisionIds);
                                    }}
                                />
                            </TableData>
                            <TableData>
                                {/* Plain text display of divisions */}
                                <div className="text-sm font-medium text-gray-700">
                                    {Array.isArray(editData.division) && editData.division.length > 0
                                        ? divisions_data
                                            .filter(div => editData.division.map(String).includes(String(div.id)))
                                            .map(div => div.division_name)
                                            .join(", ")
                                        : "No division selected"}
                                </div>
                            </TableData>
                            <TableData>
                                <PrimaryInput
                                    type="text"
                                    placeholder="Last Action"
                                    value={addData.last_action}
                                    onChange={(e) => updateAddTaskData("last_action", e.target.value)}
                                />
                            </TableData>
                            <TableData>
                                <SelectInput
                                    placeholder="Select Status"
                                    value={addData.status || preselectStatus(tableType) || ''}
                                    onChange={(value) => updateAddTaskData("status", value)}
                                >
                                    <SelectItem value="not_started">Not Started </SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>

                                </SelectInput>
                            </TableData>
                            <TableData>
                                <Datepicker
                                    value={addData.created_at}
                                    onChange={(date) => updateAddTaskData("created_at", formatDateToSave(date))}
                                />
                            </TableData>
                            <TableData>
                                <Datepicker
                                    value={addData.due_date}
                                    onChange={(date) => updateAddTaskData("due_date", formatDateToSave(date))}
                                />
                            </TableData>
                            <TableData>
                                <SelectInput
                                    placeholder="Select Priority"
                                    value={addData.priority || ''}
                                    onChange={(value) => updateAddTaskData("priority", value)}
                                >
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                    <SelectItem value="Regular">Regular</SelectItem>
                                </SelectInput>
                            </TableData>
                            {/* {isAddActive && (
                                <ActionData>
                                    <div className="flex items-center gap-3">
                                        <IconButton
                                            onClick={() => saveAdd()}
                                            iconColor="green-600"
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                            }
                                        />
                                        <IconButton
                                            onClick={() => ToggleAdd()}
                                            iconColor="red-600"
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                            }
                                        />
                                    </div>
                                </ActionData>
                            )} */}
                        </TableRow>

                    )}
                </>
            )}
        </>
    )

    return (
        <div className="space-y-2">
            {/* Add Task Button - Moved Above the Table */}
            {canShowAddButton() && (
            <button
                onClick={openAddModal}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                </svg>
                <span>Add Task</span>
            </button>
            )}

            {/* Table Container */}
            <TableContainer
                borderColor={borderColor}
                tableIcon={tableIcon}
                tableTitle={tableTitle}
                headerContent={HEADER_CONTENT}
            >
                <Table
                    thead={THEAD_CONTENT}
                    tbody={TBODY_CONTENT}
                />
            </TableContainer>

            {/* Pagination */}
            <Pagination
                links={paginationLinks}
                current_page={paginationCurrentPage}
                per_page={paginationPerPage}
                total={paginationTotal}
                last_page={paginationLastPage}
                tableType={tableType}
            />

            <TaskAddModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                addData={addData}
                updateAddTaskData={updateAddTaskData}
                saveAdd={saveAdd}
                addProcessing={addProcessing}
                users_data={users_data}
                divisions_data={divisions_data}
                tableType={tableType}
                preselectStatus={preselectStatus}
                formatDateToSave={formatDateToSave}
            />
        </div>
    );
}