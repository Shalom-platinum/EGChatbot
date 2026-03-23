"use client"


// import { toast } from "@/components/hooks/use-toast"
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "@/app-components/ui/form"
import { AppFormItem } from "./types"
import { Input } from "../ui/input"
import { AppFormFieldProps } from "../AppFormField"
import {FlexRow} from "@/app-components/FlexRow";

export function AppPasswordInput({ field, description, label, ...others }: AppFormItem & AppFormFieldProps) {


  return (
    <FormItem>
      <FlexRow>{label && <FormLabel className="text-[13px]">{label}</FormLabel>} { others.info && <>Info</>}</FlexRow>
      <FormControl>
        <Input type={'password'} placeholder="-" {...field} {...others as any}/>
      </FormControl>
      {description && (<FormDescription>
        {description}
      </FormDescription>)}
    </FormItem>

  )
}
