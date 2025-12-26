export default function ActionHeader({ children }) {
    return (
        <th className="w-[100px] px-4 py-3 text-center text-xs font-medium uppercase tracking-wider dark:text-white">
            {children}
        </th>
    )
}