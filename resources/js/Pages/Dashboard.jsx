import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MainContainer from '@/Components/DivContainer/MainContainer';
import PrimaryCard from '@/Components/DivContainer/PrimaryCard';
import TableContainer from '@/Components/DivContainer/TableContainer';
import Table from '@/Components/Table/Table';
import TableHeader from '@/Components/Table/TableHeader';
import TableRow from '@/Components/Table/TableRow';
import TableData from '@/Components/Table/TableData';
import DivisionContainer from '@/Components/Misc/DivisionContainer';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { PieChart, Pie, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/ui/chart';

export default function Dashboard({ task_counts = {}, recent_tasks = [], tasks_by_division = [] }) {

    // Polling: Fetch latest data from backend
    useEffect(() => {
        // Poll every 30 seconds
        const pollInterval = setInterval(() => {
            // Reload data
            router.get(route('dashboard.index'), {}, {
                preserveState: true,
                preserveScroll: true,
                only: ['task_counts', 'recent_tasks', 'tasks_by_division'],
            });
        }, 30000); // 30 seconds

        // Cleanup interval on unmount
        return () => {
            clearInterval(pollInterval);
        };
    }, []);

    // Prepare data for the pie chart
    const chartData = tasks_by_division
        .map((division) => ({
            name: division.division_name,
            value: division.total_tasks || 0,
            fill: division.division_color || '#3B82F6',
        }))
        .filter(item => item.value > 0); // Only include divisions with tasks

    // Sort the data by value in ascending order (smallest to largest) for better visual effect
    const sortedChartData = [...chartData].sort((a, b) => a.value - b.value);

    // Calculate total for percentage calculation
    const totalTasks = chartData.reduce((sum, item) => sum + item.value, 0);

    // Configure the size increase between each pie ring
    const BASE_RADIUS = 50; // Starting radius for the smallest pie
    const SIZE_INCREMENT = 10; // How much to increase radius for each subsequent pie

    // Create chart config for tooltips
    const chartConfig = {
        value: {
            label: "Tasks",
        },
        ...chartData.reduce((acc, item, index) => {
            acc[item.name.toLowerCase().replace(/\s+/g, '_')] = {
                label: item.name,
                color: item.fill,
            };
            return acc;
        }, {}),
    };

    const DivisionCard = ({ division }) => {
        return (
            <div className="mb-4 bg-white dark:bg-zinc-900 shadow-lg p-5">
                <div className="space-y-4">
                    <div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Division:</span>
                        <div className="mt-2">
                            <DivisionContainer bgcolor={division.division_color}>
                                {division.division_name}
                            </DivisionContainer>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Not Started:</span>
                            <p className="text-lg font-bold text-gray-600 dark:text-gray-400 mt-1">
                                {division.not_started || 0}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">In Progress:</span>
                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400 mt-1">
                                {division.in_progress || 0}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Completed:</span>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                                {division.completed || 0}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total:</span>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                                {division.total_tasks || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <AuthenticatedLayout
            header="Dashboard"
        >
            <Head title="Dashboard" />

            <MainContainer>
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <PrimaryCard>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Not Started</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {task_counts.not_started || 0}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-600 dark:text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>
                            </div>
                        </PrimaryCard>

                        <PrimaryCard>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                                        {task_counts.in_progress || 0}
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-orange-600 dark:text-orange-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>
                            </div>
                        </PrimaryCard>

                        <PrimaryCard>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                                        {task_counts.completed || 0}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600 dark:text-green-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>
                            </div>
                        </PrimaryCard>

                        <PrimaryCard>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                                        {task_counts.total || 0}
                                    </p>
                                </div>
                                <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                                    </svg>
                                </div>
                            </div>
                        </PrimaryCard>
                    </div>

                    <div className="space-y-2">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-semibold">🚩 Task by Division</h1>
                            {sortedChartData.length > 0 && totalTasks > 0 ? (
                                <Card className="flex flex-col bg-white dark:bg-zinc-900 border-gray-200 dark:border-stone-900">
                                    <CardContent className="flex-1">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="w-full md:w-1/2 lg:w-2/5 min-w-0">
                                                <div className="w-full h-[300px] min-h-[250px]">
                                                    <ChartContainer
                                                        config={chartConfig}
                                                        className="[&_.recharts-text]:fill-background"
                                                    >
                                                        <PieChart>
                                                            <ChartTooltip
                                                                content={<ChartTooltipContent nameKey="name" hideLabel />}
                                                            />
                                                            {sortedChartData.map((entry, index) => (
                                                                <Pie
                                                                    key={`pie-${index}`}
                                                                    data={[entry]}
                                                                    innerRadius={30}
                                                                    outerRadius={BASE_RADIUS + index * SIZE_INCREMENT}
                                                                    dataKey="value"
                                                                    cornerRadius={4}
                                                                    startAngle={
                                                                        // Calculate the percentage of total tasks up to current index
                                                                        (sortedChartData
                                                                            .slice(0, index)
                                                                            .reduce((sum, d) => sum + d.value, 0) /
                                                                            sortedChartData.reduce((sum, d) => sum + d.value, 0)) *
                                                                        360
                                                                    }
                                                                    endAngle={
                                                                        // Calculate the percentage of total tasks up to and including current index
                                                                        (sortedChartData
                                                                            .slice(0, index + 1)
                                                                            .reduce((sum, d) => sum + d.value, 0) /
                                                                            sortedChartData.reduce((sum, d) => sum + d.value, 0)) *
                                                                        360
                                                                    }
                                                                >
                                                                    <Cell fill={entry.fill} />
                                                                    <LabelList
                                                                        dataKey="value"
                                                                        stroke="none"
                                                                        fontSize={12}
                                                                        fontWeight={500}
                                                                        fill="white"
                                                                        formatter={(value) => value.toString()}
                                                                    />
                                                                </Pie>
                                                            ))}
                                                        </PieChart>
                                                    </ChartContainer>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-1/2 lg:w-2/5 space-y-2">
                                                {chartData.map((item) => {
                                                    const percentage = ((item.value / totalTasks) * 100).toFixed(1);
                                                    return (
                                                        <div key={item.name} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center space-x-2.5">
                                                                <span
                                                                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                                                                    style={{ backgroundColor: item.fill }}
                                                                />
                                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                                    {item.name}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                                                                    {item.value}
                                                                </span>
                                                                <span className="text-gray-500 dark:text-gray-400 tabular-nums">
                                                                    ({percentage}%)
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    <CardContent className="flex items-center justify-center py-8">
                                        <div className="text-center text-gray-500 dark:text-gray-400">
                                            No task by division
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <TableContainer
                            borderColor="border-purple-500 hidden md:block"
                        >
                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <Table
                                    thead={
                                        <tr>
                                            <TableHeader>Division</TableHeader>
                                            <TableHeader>Not Started</TableHeader>
                                            <TableHeader>In Progress</TableHeader>
                                            <TableHeader>Completed</TableHeader>
                                            <TableHeader>Total</TableHeader>
                                        </tr>
                                    }
                                    tbody={
                                        <>
                                            {tasks_by_division.length > 0 ? (
                                                tasks_by_division.map(division => (
                                                    <TableRow key={division.id}>
                                                        <TableData
                                                            className="text-center"
                                                        >
                                                            <DivisionContainer bgcolor={division.division_color}>
                                                                {division.division_name}
                                                            </DivisionContainer>
                                                        </TableData>
                                                        <TableData
                                                            className="text-center"
                                                        >
                                                            <span className="text-gray-600 dark:text-gray-400 font-semibold">
                                                                {division.not_started || 0}
                                                            </span>
                                                        </TableData>
                                                        <TableData
                                                            className="text-center"
                                                        >
                                                            <span className="text-orange-600 dark:text-orange-400 font-semibold">
                                                                {division.in_progress || 0}
                                                            </span>
                                                        </TableData>
                                                        <TableData
                                                            className="text-center"
                                                        >
                                                            <span className="text-green-600 dark:text-green-400 font-semibold">
                                                                {division.completed || 0}
                                                            </span>
                                                        </TableData>
                                                        <TableData
                                                            className="text-center"
                                                        >
                                                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                                                                {division.total_tasks || 0}
                                                            </span>
                                                        </TableData>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow
                                                    colspan={5}
                                                >
                                                    No task by division
                                                </TableRow>
                                            )}
                                        </>
                                    }
                                />
                            </div>
                        </TableContainer>

                        {/* Mobile Card View */}
                        <div className="block md:hidden">
                            {tasks_by_division.length > 0 ? (
                                tasks_by_division.map(division => (
                                    <DivisionCard key={division.id} division={division} />
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No task by division
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <h1 className="text-2xl md:text-3xl">🧐</h1>
                            <h1 className="text-2xl md:text-3xl font-semibold">Recent Tasks</h1>
                        </div>
                        {recent_tasks.length > 0 ? (
                            recent_tasks.map(task => (
                                <div key={task.id} className="bg-white p-3 md:p-4 border border-gray-300 sm:rounded-lg shadow-lg dark:bg-zinc-900 dark:border-stone-800">
                                    <div className="flex items-start space-x-3 md:space-x-4">
                                        <div className="px-3 py-3 md:px-4 md:py-4 bg-green-200 rounded-md text-green-800 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                            </svg>
                                        </div>
                                        <div className="w-full min-w-0 space-y-2 md:space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                                                <div className="flex flex-wrap items-center gap-1 text-xs md:text-sm">
                                                    <p className="font-semibold text-gray-600 dark:text-gray-400">Task Created at</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{task?.created_at}</p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-2">
                                                    <div className="px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm whitespace-nowrap" style={{ backgroundColor: task.division?.division_color || '#gray' }}>
                                                        <p className="text-white font-medium">{task.division?.division_name}</p>
                                                    </div>
                                                    <div className={`flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm whitespace-nowrap
                                                            ${task?.status === "Completed" && "bg-green-300 dark:bg-green-800"}
                                                            ${task?.status === "In Progress" && "bg-orange-300 dark:bg-orange-600"}
                                                            ${task?.status === "Not Started" && "bg-gray-300 dark:bg-gray-800"}
                                                        `}>
                                                        <p className="font-medium">{task?.status}</p>
                                                    </div>
                                                    {task?.due_date && (
                                                        <div className="px-2 py-1 md:px-3 md:py-1 bg-red-200 text-red-600 dark:bg-red-800 dark:text-red-200 font-semibold flex items-center rounded-full text-xs md:text-sm whitespace-nowrap">
                                                            <p>{task?.due_date}</p>
                                                        </div>
                                                    )}
                                                    {task?.priority && (
                                                        <div className={`px-2 py-1 md:px-3 md:py-1 flex items-center rounded text-xs md:text-sm whitespace-nowrap
                                                            ${task?.priority === "Low" && "bg-green-300 dark:bg-green-800"}
                                                            ${task?.priority === "Medium" && "bg-orange-300 dark:bg-orange-600"}
                                                            ${task?.priority === "High" && "bg-red-300 dark:bg-red-700"}
                                                        `}>
                                                            <p className="font-medium">{task?.priority}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="pt-1">
                                                <p className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white break-words">{task?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-4 md:p-6 border border-gray-300 rounded-lg shadow-lg dark:bg-black dark:border-stone-800">
                                <div className="flex items-center space-x-3 md:space-x-4">
                                    <div className="px-3 py-3 md:px-4 md:py-4 bg-blue-200 rounded-md text-blue-800 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                        </svg>
                                    </div>
                                    <div className="w-full">
                                        <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-center md:text-left">No new tasks have been created at this time</h1>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </MainContainer>
        </AuthenticatedLayout>
    );
}
