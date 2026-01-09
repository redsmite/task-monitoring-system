export default function TableContainer({ children, tableIcon, tableTitle, borderColor, headerContent }) {
    return (
        <>
            <div className="w-full flex flex-col items-center justify-between sm:flex-row">
                <span className="flex items-center gap-1 ">
                    <p className="ml-3 mb-4 text-3xl font-semibold">
                        {tableIcon}
                    </p>
                    <p className="ml-3 mb-4 text-3xl font-semibold">
                        {tableTitle}
                    </p>
                </span>
                {headerContent}
            </div>
            <div className={`overflow-x-auto overflow-y-hidden bg-gray-100 shadow-lg sm:rounded-lg dark:bg-zinc-900 border-l-8 ${borderColor}`}>
                <div className="p-1 border-t border-b border-r border-gray-300 dark:border-stone-800 rounded-r-lg min-w-full">
                    {children}
                </div>
            </div>
        </>
    )
}