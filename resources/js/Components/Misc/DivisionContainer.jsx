export default function DivisionContainer({ children, bgcolor }) {
    return (
        <span 
            className="py-2 px-4 text-gray-800 text-center font-semibold rounded w-[7rem] md:w-full"
            style={{ backgroundColor: bgcolor || '#gray' }}
        >
            {children}
        </span>
    )
}