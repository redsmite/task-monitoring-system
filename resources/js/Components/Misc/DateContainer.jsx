export default function DateContainer({ children, bgcolor }) {

    if (!children) return null
    
    return (
        <span className={`text-red-600 font-semibold sm:px-4 py-2 sm:rounded-full ${bgcolor}`}>
            {children}
        </span>
    )
}