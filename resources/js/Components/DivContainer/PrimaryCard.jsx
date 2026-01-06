export default function PrimaryCard({ children }) {
    return (
        <div className="p-6 overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
            {children}
        </div>
    )
}