export default function Sidebar({ open, onClose, task }) {
    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-90 transition-opacity
                    ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
            />

            <div
                className={`fixed top-0 right-0 h-full w-220 bg-white shadow-lg z-100
                    transform transition-transform duration-300 ease-in-out
                    ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="p-4 flex justify-between items-center border-b">
                    <button onClick={onClose}>✕</button>
                </div>

                <div className="p-4">
                    <h1 className="text-3xl font-semibold">{task?.name}</h1>
                    <p>{task?.due_date ? task?.due_date : "No due date set."}</p>
                    <p>{task?.status}</p>
                    <p>{task?.employee?.first_name} {task?.employee?.last_name}</p>
                    <p>{task?.priority ? task?.priority : "No priority set."}</p>
                    <p>{task?.division?.division_name}</p>
                    <p>{task?.description ? task?.description : "No description available."}</p>
                    <p>{task?.last_action ? task?.last_action : "No last action set."}</p>
                </div>
            </div>
        </>
    );
}
