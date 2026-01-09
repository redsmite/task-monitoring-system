import { cn } from "@/lib/utils";

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={cn(
                // Base styles - consistent across all buttons
                "inline-flex items-center justify-center gap-2",
                "h-9 px-4 py-2",
                "rounded border border-transparent",
                "text-sm font-medium",
                "whitespace-nowrap",
                // Variant styles
                "bg-destructive text-destructive-foreground",
                "shadow-sm hover:bg-destructive/90",
                // Interactive states
                "transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "active:bg-destructive/80",
                // Disabled state
                "disabled:pointer-events-none disabled:opacity-50",
                // Cursor
                "cursor-pointer",
                className
            )}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
