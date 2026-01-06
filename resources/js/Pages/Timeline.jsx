import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import MainContainer from '@/Components/DivContainer/MainContainer';
import PrimaryCard from '@/Components/DivContainer/PrimaryCard';
import Pagination from '@/Components/Misc/Pagination';
import { Head } from "@inertiajs/react";

export default function Timeline({ activities = {} }) {
    const getActionIcon = (action) => {
        switch (action) {
            case 'created':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                );
            case 'updated':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                );
            case 'deleted':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                );
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                );
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'created':
                return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
            case 'updated':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
            case 'deleted':
                return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    const activitiesList = activities?.data || [];

    return (
        <AuthenticatedLayout
            header="Timeline"
        >
            <Head title="Timeline" />

            <MainContainer>
                <PrimaryCard>
                    <div className="relative min-h-[calc(100vh-30vh)] flex flex-col">
                        {/* Timeline */}
                        <div className="space-y-6 flex-1 flex flex-col">
                            {activitiesList.length > 0 ? (
                                activitiesList.map((activity, index) => (
                                    <div key={activity.id} className="relative flex gap-4 w-full">
                                        {/* Timeline line */}
                                        {index !== activitiesList.length - 1 && (
                                            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                                        )}
                                        
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getActionColor(activity.action)}`}>
                                            {getActionIcon(activity.action)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pb-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                                                        {activity.description}
                                                    </p>
                                                    {activity.changes && Object.keys(activity.changes).length > 0 && (
                                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <p className="font-medium mb-1">Changes:</p>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {Object.entries(activity.changes).map(([key, change]) => (
                                                                    <li key={key}>
                                                                        <span className="font-medium">{key}:</span> {String(change.from || 'N/A')} → {String(change.to || 'N/A')}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {activity.user && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                            by {activity.user.name || activity.user.email}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                                                    {formatTimestamp(activity.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                                    No activities found
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {activities?.links && activities.links.length > 0 && (
                            <div className="mt-8">
                                <Pagination
                                    links={activities.links}
                                    current_page={activities.current_page}
                                    per_page={activities.per_page}
                                    total={activities.total}
                                    last_page={activities.last_page}
                                />
                            </div>
                        )}
                    </div>
                </PrimaryCard>
            </MainContainer>
        </AuthenticatedLayout>
    )
}