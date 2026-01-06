export default function IconButton({ icon, iconColor, onClick, tooltip = "This is a tooltip!", isDisabled = false }) {
    return (
        <button
            title={tooltip}
            className={`text-${iconColor} hover:text-${iconColor}-dark focus:outline-none cursor-pointer disabled:cursor-not-allowed`}
            onClick={onClick}
            disabled={isDisabled}
        >
            {icon}
        </button>
    )
}