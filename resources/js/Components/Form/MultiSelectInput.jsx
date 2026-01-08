import { useState } from 'react';
import Label from '@/Components/Form/Label';
import { Popover, PopoverTrigger, PopoverContent } from '@/Components/ui/popover';
import { Button } from '@/Components/ui/button';
import Checkbox from '@/Components/Checkbox';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MultiSelectInput({ 
    label, 
    placeholder, 
    options = [], 
    value = [], 
    defaultValue = [], 
    onChange, 
    error,
    className 
}) {
    const [open, setOpen] = useState(false);
    const selectedValues = value || defaultValue || [];
    
    // Ensure selectedValues is always an array
    const selectedArray = Array.isArray(selectedValues) 
        ? selectedValues 
        : selectedValues ? [selectedValues] : [];

    const handleToggle = (optionValue) => {
        const stringValue = String(optionValue);
        const newValues = selectedArray.includes(stringValue)
            ? selectedArray.filter(v => v !== stringValue)
            : [...selectedArray, stringValue];
        
        onChange?.(newValues);
    };

    const handleRemove = (e, valueToRemove) => {
        e.stopPropagation();
        const newValues = selectedArray.filter(v => v !== valueToRemove);
        onChange?.(newValues);
    };

    const selectedOptions = options.filter(opt => 
        selectedArray.includes(String(opt.id))
    );

    const displayText = selectedOptions.length > 0
        ? `${selectedOptions.length} selected`
        : placeholder || 'Select...';

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <Label title={label} />
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between min-h-9 py-2 px-3 text-left touch-manipulation",
                            "flex items-start",
                            selectedOptions.length > 0 ? "h-auto" : "h-9",
                            !selectedArray.length && "text-muted-foreground"
                        )}
                    >
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-1 min-w-0">
                            {selectedOptions.length > 0 ? (
                                selectedOptions.map((option) => (
                                    <span
                                        key={option.id}
                                        className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs bg-primary/10 text-primary border border-primary/20 whitespace-nowrap"
                                        style={{ backgroundColor: option.division_color ? `${option.division_color}20` : undefined }}
                                    >
                                        <span className="truncate max-w-[80px] sm:max-w-none">
                                            {option.division_name || option.name || String(option.id)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => handleRemove(e, String(option.id))}
                                            className="ml-0.5 sm:ml-1 hover:bg-primary/20 active:bg-primary/30 rounded-full p-0.5 sm:p-0.5 flex-shrink-0 touch-manipulation min-w-[20px] min-h-[20px] flex items-center justify-center"
                                            aria-label={`Remove ${option.division_name || option.name}`}
                                        >
                                            <X className="h-3 w-3 sm:h-3 sm:w-3" />
                                        </button>
                                    </span>
                                ))
                            ) : (
                                <span className="truncate text-sm sm:text-base">{displayText}</span>
                            )}
                        </div>
                        <ChevronDown className={cn(
                            "ml-2 h-4 w-4 shrink-0 opacity-50",
                            selectedOptions.length > 0 ? "mt-1 sm:mt-0" : ""
                        )} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-[calc(100vw-2rem)] sm:w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] sm:max-w-none p-2 sm:p-2" 
                    align="start"
                    sideOffset={8}
                >
                    <div className="max-h-[60vh] sm:max-h-[300px] overflow-y-auto space-y-1 overscroll-contain multiselect-scrollbar">
                        {options.length === 0 ? (
                            <div className="px-2 py-3 sm:py-1.5 text-sm text-muted-foreground text-center">
                                No options available
                            </div>
                        ) : (
                            options.map((option) => {
                                const isSelected = selectedArray.includes(String(option.id));
                                return (
                                    <div
                                        key={option.id}
                                        className={cn(
                                            "flex items-center space-x-2 sm:space-x-2 px-3 py-3 sm:px-2 sm:py-1.5 rounded-sm hover:bg-accent active:bg-accent/80 cursor-pointer touch-manipulation min-h-[44px] sm:min-h-0",
                                            isSelected && "bg-accent"
                                        )}
                                        onClick={() => handleToggle(option.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleToggle(option.id);
                                            }
                                        }}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onChange={() => handleToggle(option.id)}
                                            className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0 touch-manipulation"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="text-sm sm:text-sm flex-1 truncate">
                                            {option.division_name || option.name || String(option.id)}
                                        </span>
                                        {option.division_color && (
                                            <span
                                                className="h-4 w-4 sm:h-3 sm:w-3 rounded-full border border-gray-300 flex-shrink-0"
                                                style={{ backgroundColor: option.division_color }}
                                            />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {error && (
                <p className="text-red-600 dark:text-red-500 text-sm">{error}</p>
            )}
        </div>
    );
}

