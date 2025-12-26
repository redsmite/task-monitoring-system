export default function TableHeader({ children }) {
    return (
        <th className="w-[150px] min-w-[150px] max-w-[190px] px-4 py-3 text-center text-xs font-medium uppercase tracking-wider dark:text-white">
            {children}
        </th>
    )
}