export default function DateContainer({ children, bgcolor, textColor = 'text-red-600' }) {

    if (!children) return null
    
    return (
        <span className={`${textColor} font-semibold px-4 py-2 rounded-full ${bgcolor}`}>
            {children}
        </span>
    )
}