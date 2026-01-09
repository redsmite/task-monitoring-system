import { cn } from "@/lib/utils";

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    text,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={cn(
                // Base styles - consistent across all buttons
                "inline-flex items-center justify-center gap-2",
                "h-9 px-4 py-2",
                "rounded",
                "text-sm font-medium",
                "whitespace-nowrap",
                // Variant styles
                "border border-input bg-secondary text-secondary-foreground",
                "shadow-sm hover:bg-secondary/80",
                // Interactive states
                "transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "active:bg-secondary/70",
                // Disabled state
                "disabled:pointer-events-none disabled:opacity-50",
                // Cursor
                "cursor-pointer",
                className
            )}
            disabled={disabled}
        >
            {text}
        </button>
    );
}
