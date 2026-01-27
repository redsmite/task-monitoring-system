export default function TableData({ children, colSpan, customWidth = "", className = "" }) {
    let baseClassName = "px-4 py-3 text-sm dark:text-white font-semibold";

    if (customWidth === "") {
        baseClassName = "min-w-[150px] max-w-[150px] px-2 py-3 text-sm dark:text-white font-semibold";
    } else {
        baseClassName = "px-4 py-3 text-sm dark:text-white font-semibold";
    }

    return (
        <td
            className={`${baseClassName} ${customWidth} ${className}`}
            colSpan={colSpan}
            title={typeof children === "string" ? children : undefined}
        >
            {children}
        </td>
    );
}
