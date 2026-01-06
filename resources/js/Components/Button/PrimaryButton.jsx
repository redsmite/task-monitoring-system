export default function PrimaryButton({ text, onClick, disabled }) {
    return (
        <button
            className={`w-full bg-blue-700 text-sm text-white py-2 px-2 rounded cursor-pointer hover:bg-cyan-600 hover:text-gray-100 transition duration-300 ${
                disabled && 'opacity-25 cursor-not-allowed'
            }`}
            onClick={onClick}
            disabled={disabled}
        >
            {text}
        </button>
    )
}