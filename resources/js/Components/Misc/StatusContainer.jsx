export default function StatusContainer({ children, status }) {

    const statusColor = (status) => {
        if (status === "Not Started") {
            return "bg-gray-400";
        }

        if (status === "In Progress") {
            return "bg-orange-400"; 
        }

        if (status === "Completed") {
            return "bg-green-400"
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