export default function TableRow({ children, colspan, onClick, className = "" }) {
    const baseClassName = "divide-x divide-gray-200 dark:divide-gray-700 hover:bg-gray-200 dark:hover:bg-gray-900";
    const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName;
    
    return (
        <tr className={combinedClassName} onClick={onClick}>
            {colspan ? (
                <td colSpan={colspan} className="text-center py-4">
                    {children}
                </td>
            ) : (
                children
            )}
        </tr>
    );
}
