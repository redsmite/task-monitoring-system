import { useState } from 'react';

export default function test() {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <p>test page</p>
        
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
            >
                Open Sidebar
            </button>

            <div
                onClick={() => setIsSidebarOpen(false)}
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity
                    ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            />

            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-lg font-semibold">Sidebar</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-800"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4">
                    Sidebar content here
                </div>
            </div>
        </>
    )
}