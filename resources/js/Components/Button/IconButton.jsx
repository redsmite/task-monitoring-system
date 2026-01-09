import { cn } from "@/lib/utils";

export default function IconButton({ 
    icon, 
    iconColor, 
    onClick, 
    tooltip = "This is a tooltip!", 
    isDisabled = false,
    variant = "ghost" // ghost, filled
}) {
    // Map semantic color names to theme-aware classes
    const semanticColors = {
        primary: "text-primary hover:text-primary/80 dark:hover:text-primary/90",
        secondary: "text-secondary-foreground hover:text-secondary-foreground/80",
        destructive: "text-destructive hover:text-destructive/80",
        muted: "text-muted-foreground hover:text-muted-foreground/80",
        accent: "text-accent-foreground hover:text-accent-foreground/80",
        default: "text-foreground hover:text-foreground/80",
    };

    // Map common Tailwind colors to theme-aware alternatives with dark mode support
    const colorMapping = {
        "green-600": variant === "filled" 
            ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300"
            : "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300",
        "red-600": variant === "filled"
            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
            : "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300",
        "blue-600": variant === "filled"
            ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
            : "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
        "yellow-600": "text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300",
        "gray-600": "text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
        "indigo-600": "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300",
    };

    // Determine color class: semantic > mapped > default
    // For unknown colors, use foreground color to ensure theme compatibility
    let colorClass = semanticColors[iconColor] || 
                     colorMapping[iconColor] || 
                     semanticColors.default;

    return (
        <button
            title={tooltip}
            className={cn(
                // Base styles - consistent with other buttons
                "inline-flex items-center justify-center",
                "h-9 w-9",
                "rounded",
                "transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                // Disabled state
                "disabled:pointer-events-none disabled:opacity-50",
                // Cursor
                "cursor-pointer",
                // Color variant
                colorClass
            )}
            onClick={onClick}
            disabled={isDisabled}
        >
            {icon}
        </button>
    )
}