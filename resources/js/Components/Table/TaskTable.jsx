import { useState, useEffect, useRef } from 'react'
import { router } from "@inertiajs/react";
import { SelectItem } from "@/components/ui/select"
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
import Datepicker from '../Form/Datepicker';
import IconButton from '../Button/IconButton';
import { format, parse } from 'date-fns';
import DateContainer from '../Misc/DateContainer';
import StatusContainer from '../Misc/StatusContainer';
import PriorityContainer from '../Misc/PriorityContainer';
import ActionData from './ActionData';
import ActionHeader from './ActionHeader';


export default function TaskTable({
    borderColor = "border-blue-500",
    tableIcon = "icon",
    tableTitle = "tableTitle",
    data,
    employees_data,
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
    onRowClick
}) {

    // Search/Pagination/Ordering/URL //
    // Url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Url Parms
    let search = urlParams.get(`${tableType}_search`) || '';
    let sort = urlParams.get(`${tableType}_sort`) || 'desc';
    let page = urlParams.get(`${tableType}_page`) || 1;

    // Clean Sort Value
    if (sort !== 'asc' && sort !== 'desc') {
        sort = 'desc';
    }

    // State
    const [searchValues, setSearchValues] = useState(search || '');
    const [sortValues, setSortValues] = useState(sort || 'desc');
    const [pageValues, setPageValues] = useState(page || 1);
    const isInitialMount = useRef(true);

    // Set
    const handleSearchChange = (value) => {
        setSearchValues(value);
        setPageValues(1);
    }

    const handleSortChange = (value) => {
        setSortValues(value);
    }

    // Effects
    useEffect(() => {
        const sortParam = `${tableType}_sort`;
        const searchParam = `${tableType}_search`;
        const pageParam = `${tableType}_page`;

        const currentParams = Object.fromEntries(
            new URLSearchParams(window.location.search)
        );

        // Check if this table's params already exist and match current state
        const existingSort = currentParams[sortParam];
        const existingSearch = currentParams[searchParam];
        const existingPage = currentParams[pageParam];

        // On initial mount, handle the empty URL case
        if (isInitialMount.current) {
            isInitialMount.current = false;

            // If all params for this table already exist and match, skip update
            if (existingSort === String(sortValues) &&
                existingSearch === String(searchValues) &&
                existingPage === String(pageValues)) {
                return; // Params already match, no need to update
            }

            // If URL is completely empty, stagger initialization to prevent race conditions
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

        // Only update if something changed
        if (!sortChanged && !searchChanged && !pageChanged) {
            return;
        }

        // When sorting changes, preserve current page from URL if available
        const pageToUse = existingPage || pageValues;

        const searchUrl = {
            ...currentParams,
            [sortParam]: sortValues,
            [searchParam]: searchValues,
            [pageParam]: pageToUse,
        }

        router.get(route('task.index'), searchUrl, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        })
    }, [sortValues, searchValues, pageValues, tableType]);

    // Table Adding //
    // State
    const [isAddActive, setIsAddActive] = useState(null);

    // Ensure only one TaskTable add row is open at a time across the page
    useEffect(() => {
        const handleAddToggle = (event) => {
            const activeTable = event.detail?.tableType || null;
            if (activeTable !== tableType) {
                setIsAddActive(null);
            }
        };

        window.addEventListener('task-table-add-toggle', handleAddToggle);
        return () => window.removeEventListener('task-table-add-toggle', handleAddToggle);
    }, [tableType]);

    // Set
    const ToggleAdd = () => {
        resetAddData();

        setIsAddActive((prev) => {
            const next = prev ? null : tableType;
            // Seed status to the table's default when opening the add row
            if (!prev && !addData.status) {
                setDataAdd((data) => ({
                    ...data,
                    status: preselectStatus(tableType),
                }));
            }
            window.dispatchEvent(new CustomEvent('task-table-add-toggle', {
                detail: { tableType: next }
            }));
            return next;
        });
    };

    // Add
    const updateAddTaskData = (field, value) => {
        setDataAdd((data) => ({
            ...data,
            [field]: value,
        }))
    }

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
    const ToggleEdit = (task) => {
        setIsEditActive((prev) => {
            const isCurrentlyOpen = !!prev[task.id];

            if (isCurrentlyOpen) {
                // Close this row
                const next = { ...prev };
                delete next[task.id];
                // optional: also clear form state here
                // setEditData({});
                return next;
            }

            // Open this row and close all others
            // (if you want only one open at a time)
            const next = { [task.id]: true };

            // Seed form data when opening
            setEditData({
                task_name: task.name || '',
                assignee: task.employee?.id ? String(task.employee.id) : '',
                division: task.division?.id ? String(task.division.id) : '',
                last_action: task.last_action || '',
                status: formatStatusToDb(task.status) || '',
                priority: formatPriorityToDb(task.priority) || '',
                due_date: task.due_date || '',
                description: task.description || '',
            });

            return next;
        });
    };


    // Edit
    const updateEditTaskData = (field, value) => {
        // useForm setData is async; use the callback form to avoid stale reads
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
            'High': 'high',
            'Medium': 'medium',
            'Low': 'low',
        }
        return map[value] || value;
    }

    const formatDateToSave = (value) => {
        const date = value instanceof Date ? value : new Date(value);
        return format(date, 'yyyy-MM-dd');
    }

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
            <SelectInput
                placeholder="Sort Order"
                value={sortValues}
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
                    {!isAddActive && (
                        <TableRow
                            onClick={() => ToggleAdd(tableType)}
                        >
                            <TableData
                                colSpan="8"
                                className="cursor-pointer"
                            >
                                ➕ Add Task
                            </TableData>
                        </TableRow>
                    )}

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
                                <SelectInput
                                    placeholder="Select Assignee"
                                    value={addData.assignee}
                                    onChange={(value) => updateAddTaskData("assignee", value)}
                                >
                                    {employees_data.map((employee) => (
                                        <SelectItem key={employee.id} value={String(employee.id)}>
                                            {employee.last_name} {employee.first_name}
                                        </SelectItem>
                                    ))}

                                </SelectInput>
                            </TableData>
                            <TableData>
                                <SelectInput
                                    placeholder="Select Division"
                                    value={addData.division}
                                    onChange={(value) => updateAddTaskData("division", value)}

                                >
                                    {divisions_data.map((division) => (
                                        <SelectItem key={division.id} value={String(division.id)}>
                                            {division.division_name}
                                        </SelectItem>
                                    ))}

                                </SelectInput>
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
                                    value={addData.status || preselectStatus(tableType)}
                                    onChange={(value) => updateAddTaskData("status", value)}
                                >
                                    <SelectItem value="not_started">Not Started</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>

                                </SelectInput>
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
                                    value={addData.priority}
                                    onChange={(value) => updateAddTaskData("priority", value)}
                                >
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
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

                    )}
                </>
            )}

            {data.map(task => (
                <TableRow
                    key={task.id}
                    onClick={isEditActive[task.id] ? undefined : () => onRowClick(task)}
                    className={isEditActive[task.id] ? '' : 'cursor-pointer'}
                >
                    {!isEditActive[task.id] && (
                        <>
                            <TableData
                                customWidth="min-w-[210px] max-w-[210px]"
                            >
                                {task?.name}
                            </TableData>
                            <TableData>
                                {task?.employee?.first_name} {task?.employee?.last_name}
                            </TableData>
                            <TableData
                                className="text-center"
                            >
                                <DivisionContainer
                                    bgcolor={task?.division?.division_color}
                                >
                                    {task?.division?.division_name}
                                </DivisionContainer>
                            </TableData>
                            <TableData>
                                {task?.last_action}
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
                                <SelectInput
                                    placeholder="Select Assignee"
                                    defaultValue={editData?.assignee || (task?.employee?.id ? String(task.employee.id) : undefined)}
                                    onChange={(value) => updateEditTaskData("assignee", value)}
                                >
                                    {employees_data.map((employee) => (
                                        <SelectItem key={employee.id} value={String(employee.id)}>
                                            {employee.last_name} {employee.first_name}
                                        </SelectItem>
                                    ))}

                                </SelectInput>
                            </TableData>
                            <TableData>
                                <SelectInput
                                    placeholder="Select Division"
                                    defaultValue={editData?.division || (task?.division?.id ? String(task.division.id) : undefined)}
                                    onChange={(value) => updateEditTaskData("division", value)}

                                >
                                    {divisions_data.map((division) => (
                                        <SelectItem key={division.id} value={String(division.id)}>
                                            {division.division_name}
                                        </SelectItem>
                                    ))}

                                </SelectInput>
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
                                    defaultValue={editData?.status || formatStatusToDb(task?.status) || ''}
                                    onChange={(value) => updateEditTaskData("status", value)}
                                >
                                    <SelectItem value="not_started">Not Started</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>

                                </SelectInput>
                            </TableData>
                            <TableData>
                                <Datepicker
                                    value={editData?.due_date || task?.due_date || ''}
                                    onChange={(date) => updateEditTaskData("due_date", formatDateToSave(date))}
                                />
                            </TableData>
                            <TableData>
                                <SelectInput
                                    placeholder="Select Priority"
                                    defaultValue={editData?.priority || formatPriorityToDb(task?.priority) || ''}
                                    onChange={(value) => updateEditTaskData("priority", value)}
                                >
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectInput>
                            </TableData>
                        </>
                    )}

                    <ActionData>
                        {!isEditActive[task.id] && (
                            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
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
            ))}

            {formattedSortValue(sortValues) === tableType + '_' + 'asc' && formattedLastPageValue(paginationLastPage) === tableType + '_page=' + page && (
                <>
                    {!isAddActive && (
                        <TableRow
                            onClick={() => ToggleAdd(tableType)}
                        >
                            <TableData
                                colSpan="8"
                                className="cursor-pointer"
                            >
                                ➕ Add Task
                            </TableData>
                        </TableRow>
                    )}

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
                                <SelectInput
                                    placeholder="Select Assignee"
                                    value={addData.assignee}
                                    onChange={(value) => updateAddTaskData("assignee", value)}
                                >
                                    {employees_data.map((employee) => (
                                        <SelectItem key={employee.id} value={String(employee.id)}>
                                            {employee.last_name} {employee.first_name}
                                        </SelectItem>
                                    ))}

                                </SelectInput>
                            </TableData>
                            <TableData>
                                <SelectInput
                                    placeholder="Select Division"
                                    value={addData.division}
                                    onChange={(value) => updateAddTaskData("division", value)}

                                >
                                    {divisions_data.map((division) => (
                                        <SelectItem key={division.id} value={String(division.id)}>
                                            {division.division_name}
                                        </SelectItem>
                                    ))}

                                </SelectInput>
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
                                    value={addData.status || preselectStatus(tableType)}
                                    onChange={(value) => updateAddTaskData("status", value)}
                                >
                                    <SelectItem value="not_started">Not Started</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>

                                </SelectInput>
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
                                    value={addData.priority}
                                    onChange={(value) => updateAddTaskData("priority", value)}
                                >
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
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

                    )}
                </>
            )}
        </>
    )

    return (
        <div className="space-y-2">
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
            <Pagination
                links={paginationLinks}
                current_page={paginationCurrentPage}
                per_page={paginationPerPage}
                total={paginationTotal}
                last_page={paginationLastPage}
                tableType={tableType}
            />
        </div>
    );
}