import {FormItem, FormLabel, FormMessage} from "@/app-components/ui/form"
import {AppFormItem} from "./types"
import {AppFormFieldProps} from "../AppFormField"
import {FlexRow} from "@/app-components/FlexRow";
import {Checkbox} from "@/app-components/ui/checkbox";

export interface AppSelectItem {key?: any, title: string, value: any}

export interface AppSelectProps { items: AppSelectItem[] }

export function AppCheckbox({field, label, items = [], placeholder, info}: AppFormItem & AppFormFieldProps & AppSelectProps) {

    return (
        <FormItem>
            <FlexRow>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                <FormLabel>{label}</FormLabel>
            </FlexRow>
            <FormMessage/>
        </FormItem>

    )
}
