export default function TableData({ children, colSpan, className = "" }) {
    const baseClassName = "w-[150px] min-w-[150px] max-w-[190px] px-4 py-3 text-sm dark:text-white text-lg font-semibold truncate";
    const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName;
    
    return (
        <td className={combinedClassName} colSpan={colSpan}>
            {children}
        </td>
    )
}