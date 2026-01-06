export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen min-w-screen bg-gray-100 dark:bg-zinc-800">
            <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
                {children}
            </div>
        </div>
    );
}
