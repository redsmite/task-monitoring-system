export default function DivisionContainer({ children, bgcolor, compact = false }) {
    return (
        <span 
            className={compact 
                ? "py-1 px-2 text-gray-800 text-center font-semibold rounded text-[10px] sm:text-xs whitespace-nowrap"
                : "py-1.5 sm:py-2 px-2 sm:px-4 text-gray-800 text-center font-semibold rounded text-xs sm:text-sm w-full sm:w-auto min-w-[60px] sm:min-w-[7rem]"
            }
            style={{ backgroundColor: bgcolor || '#gray' }}
        >
            {children}
        </span>
    )
}