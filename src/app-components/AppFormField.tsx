"use client"
import {UseFormReturn} from "react-hook-form"

import {
    FormField,
} from "@/app-components/ui/form"
import {FC} from "react"
import {AppInput} from "./form/AppInput"
import {AppSelectItem} from "./form/AppSelect"

export interface AppFormFieldProps {
    form?: UseFormReturn<any>;
    name: string;
    label?: string;
    description?: string;
    placeholder?: string;
    Component?: any;
    items?: AppSelectItem[];
    disabled?: boolean;
    info?: string;
}

export const AppFormField: FC<AppFormFieldProps> = ({
                                                        form,
                                                        name,
                                                        description,
                                                        placeholder,
                                                        label,
                                                        items,
                                                        disabled = false,
                                                        Component = AppInput,
                                                        info
                                                    }) => {
    return (
        <FormField
            control={form.control}
            disabled={disabled}
            name={name}
            render={({field}) => (
                <Component field={field} label={label} description={description} placeholder={placeholder} items={items} info={info}/>
            )}
        />
    )
}
