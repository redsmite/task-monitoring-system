export default function IconButton({icon, iconColor, onClick, isDisabled=false }) {
    return (
        <button 
            className={`text-${iconColor} hover:text-${iconColor}-dark focus:outline-none`} 
            onClick={onClick}
            disabled={isDisabled}
        >
            {icon}
        </button>
    )
}