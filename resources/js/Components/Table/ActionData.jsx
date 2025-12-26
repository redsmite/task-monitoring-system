export default function ActionData({ children, colSpan, className = "" }) {
    const baseClassName = "w-[100px] pl-8 py-3";
    const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName;
    
    return (
        <td className={combinedClassName} colSpan={colSpan}>
            {children}
        </td>
    )
}