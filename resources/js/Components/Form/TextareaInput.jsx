import { Textarea } from "@/components/ui/textarea"
import Label from "@/Components/Form/Label"

export default function TextareaInput({ label, ...props }) {
    return (
        <div className="space-y-2">
            <Label
                title={label}
            />

            <Textarea
                {...props}
            />
        </div>
    )
}