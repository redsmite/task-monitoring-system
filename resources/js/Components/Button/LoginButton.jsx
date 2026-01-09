import { cn } from "@/lib/utils";

export default function PrimaryButton({ text, onClick, disabled, className=""}) {
    return (
        <button
            className={cn(
                // Base styles - consistent across all buttons
                "w-full inline-flex items-center justify-center gap-2",
                "h-9 px-4 py-2",
                "rounded border border-transparent",
                "text-sm font-medium",
                "whitespace-nowrap",
                // Variant styles
                "bg-primary text-primary-foreground",
                "shadow hover:bg-primary/90",
                // Interactive states
                "transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "active:bg-primary/80",
                // Disabled state
                "disabled:pointer-events-none disabled:opacity-50",
                // Cursor
                "cursor-pointer",
                className
            )}
            onClick={onClick}
            disabled={disabled}
        >
            {text}
        </button>
    )
}