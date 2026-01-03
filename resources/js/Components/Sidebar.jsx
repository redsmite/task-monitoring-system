import StatusContainer from "./Misc/StatusContainer";
import PriorityContainer from "./Misc/PriorityContainer";
import DivisionContainer from "./Misc/DivisionContainer";
import DateContainer from "./Misc/DateContainer";

export default function Sidebar({ open, onClose, task }) {
    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-90 transition-opacity
                    ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
            />

            <div
                className={`fixed top-0 right-0 h-full w-160 bg-white dark:bg-stone-800 shadow-lg z-100
                    transform transition-transform duration-300 ease-in-out
                    ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="p-4 flex justify-between items-center border-b">
                    <button onClick={onClose}>✕</button>
                </div>

                <div className="p-4 space-y-6">
                    <div className="">
                        <div className="flex justify-end gap-4">
                            <StatusContainer
                                status={task?.status}
                            >
                                {task?.status}
                            </StatusContainer>
                            <PriorityContainer
                                priority={task?.priority ? task?.priority : ''}
                            >
                                {task?.priority ? task?.priority : "No priority set."}
                            </PriorityContainer>
                        </div>
                        <h1 className="text-3xl font-semibold">{task?.name}</h1>
                    </div>
                    <div className="grid grid-cols-3 border border-gray-300 rounded overflow-hidden">
                        <div className="min-h-48 col-span-3 p-3 border-b border-gray-300">
                            <p className="text-sm font-semibold italic">{task?.description ? task?.description : "No description available."}</p>
                        </div>
                        <div className="min-h-44 p-3 flex flex-col border-r border-gray-300">
                            <div className="flex justify-center">
                                <h1 className="text-md font-semibold">📅Due Date</h1>
                            </div>
                            <div className="flex flex-1 justify-center items-center">
                                <DateContainer
                                    bgcolor="bg-red-100"
                                >
                                    {task?.due_date ? `${task.due_date}` : "No due date set."}
                                </DateContainer>
                            </div>
                        </div>

                        <div className="min-h-44 p-3 flex flex-col border-r border-gray-300">
                            <div className="flex justify-center">
                                <h1 className="text-md font-semibold">👤Assigned To</h1>
                            </div>
                            <div className="flex flex-1 justify-center items-center">
                                <p className="text-violet-500 font-semibold">{task?.employee?.first_name} {task?.employee?.last_name}</p>
                            </div>
                        </div>

                        <div className="min-h-44 p-3 flex flex-col">
                            <div className="flex justify-center">
                                <h1 className="text-md font-semibold">🔰Division</h1>
                            </div>
                            <div className="flex flex-1 justify-center items-center">
                                <div>
                                    <DivisionContainer
                                        bgcolor={task?.division?.division_color}
                                    >
                                        {task?.division?.division_name}
                                    </DivisionContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="">
                        <h1 className="text-lg font-semibold">Updates</h1>
                        <p>{task?.last_action ? task?.last_action : "No last action set."}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
