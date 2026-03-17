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
import { Textarea } from "../ui/textarea"

export function AppTextArea({ field, description, label, ...others }: AppFormItem & AppFormFieldProps) {


  return (
    <FormItem>
      {label && <FormLabel className="text-[13px]">{label}</FormLabel>}
      <FormControl>
      <Textarea
                  // placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />      </FormControl>
      {description && (<FormDescription>
        {description}
      </FormDescription>)}
    </FormItem>

  )
}
