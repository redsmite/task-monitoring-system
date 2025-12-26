export default function PriorityContainer({ children, priority }) {

    if (!children) return null

    const priorityColor = (status) => {
        if (status === "Low") {
            return "bg-cyan-300";
        }

        if (status === "Medium") {
            return "bg-violet-300";
        }

        if (status === "High") {
            return "bg-red-300"
        }

        return "bg-blue-300";
    }

    return(
        <div className="flex items-center gap-2">
            <span className={`p-3 rounded-full ${priorityColor(priority)}`}>
            </span>

            <p className="text-black font-semibold dark:text-white">
                {children}
            </p>
        </div>
    )
}