export default function MainContainer({ children }) {
    return (
        <div className="py-12">
            <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
                {children}
            </div>
        </div>
    )
}