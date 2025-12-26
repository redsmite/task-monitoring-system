export default function DivisionContainer({ children, bgcolor }) {
    return (
        <span 
            className="w-full py-2 px-4 text-gray-800 font-semibold rounded"
            style={{ backgroundColor: bgcolor || '#gray' }}
        >
            {children}
        </span>
    )
}