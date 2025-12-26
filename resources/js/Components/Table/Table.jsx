export default function Table({ thead, tbody }) {
    return (
        <table className="min-w-full table-fixed divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-black">
                {thead}
            </thead>
            <tbody className="bg-white dark:bg-black divide-y divide-gray-300 dark:divide-gray-700">
                {tbody}
            </tbody>
        </table>
    )
}