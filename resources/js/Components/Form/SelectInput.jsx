import Label from '@/Components/Form/Label';

import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function SelectInput({ label, placeholder, children, value, defaultValue, onChange, error }) {
    const selectProps = {}

    if (value !== undefined && value !== null) {
        selectProps.value = value
    } else if (defaultValue !== undefined && defaultValue !== null) {
        selectProps.defaultValue = defaultValue
    }

    return (
        <div className="space-y-2">

            <Label
                title={label}
            />

            <Select {...selectProps} onValueChange={onChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {children}
                </SelectContent>
            </Select>

            <p className="text-red-600 dark:text-red-500">{error}</p>
        </div>
    )
}