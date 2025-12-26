"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import Label from '@/Components/Form/Label';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export default function Datepicker({ label, value, onChange }) {
    return (
        <div className="space-y-2">
            {label && <Label title={label} />}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        data-empty={value ? "false" : "true"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(value, "PPP") : "Pick a date"}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={onChange} // directly forward the new date
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
