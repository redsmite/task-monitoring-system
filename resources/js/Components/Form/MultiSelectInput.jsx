import { useState, useMemo } from 'react';
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
    const [search, setSearch] = useState("");

    const selectedValues = value || defaultValue || [];

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

    // 🟢 Selected users
    const selectedOptions = options.filter(opt =>
        selectedArray.includes(String(opt.id))
    );

    const displayText = selectedOptions.length > 0
        ? `${selectedOptions.length} selected`
        : placeholder || 'Select...';

    // 🔍 Search filter
    const filteredOptions = useMemo(() => {
        if (!search) return options;

        const term = search.toLowerCase();

        return options.filter(opt => {
            const name = (opt.name || "").toLowerCase();
            const division = (opt.division_name || "").toLowerCase();
            return name.includes(term) || division.includes(term);
        });
    }, [search, options]);

    return (
        <div className={cn("space-y-2", className)}>
            {label && <Label title={label} />}

            <Popover
                open={open}
                onOpenChange={(v) => {
                    setOpen(v);
                    if (!v) setSearch("");
                }}
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "mb-2 w-full justify-between min-h-9 py-2 px-3 text-left flex items-start",
                            selectedOptions.length > 0 ? "h-auto" : "h-9",
                            !selectedArray.length && "text-muted-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                            
                            {/* 🟢 SHOW SELECTED USERS HERE */}
                            {selectedOptions.length > 0 ? (
                                selectedOptions.map((option) => (
                                    <span
                                        key={option.id}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-primary/10 text-primary border"
                                    >
                                        {option.division_name || option.name}

                                        <span
                                            onClick={(e) => handleRemove(e, String(option.id))}
                                            className="ml-1 cursor-pointer"
                                        >
                                            <X className="h-3 w-3" />
                                        </span>
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm">{displayText}</span>
                            )}
                        </div>

                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="p-2 w-[var(--radix-popover-trigger-width)]">
                    <div className="space-y-2">

                        {/* 🔍 SEARCH */}
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                        />

                        <div className="max-h-[300px] overflow-y-auto space-y-1">

                            {/* 🔴 NO RESULTS */}
                            {filteredOptions.length === 0 ? (
                                <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                                    No results found
                                </div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const isSelected = selectedArray.includes(String(option.id));

                                    return (
                                        <div
                                            key={option.id}
                                            className={cn(
                                                "flex items-center space-x-2 px-3 py-2 rounded-sm hover:bg-accent cursor-pointer",
                                                isSelected && "bg-accent"
                                            )}
                                            onClick={() => handleToggle(option.id)}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => handleToggle(option.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className="text-sm flex-1 truncate">
                                                {option.division_name || option.name}
                                            </span>
                                        </div>
                                    );
                                })
                            )}

                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {error && (
                <p className="text-red-600 text-sm">{error}</p>
            )}
        </div>
    );
}
