export default function StatusContainer({ children, status }) {

    const statusColor = (status) => {
        if (status === "Not Started") {
            return "bg-slate-300 dark:bg-slate-700";
        }

        if (status === "In Progress") {
            return "bg-orange-200 dark:bg-amber-700"; 
        }

        if (status === "Completed") {
            return "bg-emerald-200 dark:bg-emerald-700"
        }

        return "bg-blue-300";
    }

    return (
        <div className="flex items-center gap-2">
            <span className={`p-3 rounded-full ${statusColor(status)}`}>
            </span>

            <p className="text-black font-semibold dark:text-white">
                {children}
            </p>
        </div>
    )
}