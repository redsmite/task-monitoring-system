export default function Badge({ children, bgcolor = 'bg-blue-500' }) {
    return (
        <span 
            className={`inline-block px-4 py-1 w-full font-semibold text-sm text-white text-center rounded-full ${bgcolor}`}
        >
            {children}
        </span>
    )
}