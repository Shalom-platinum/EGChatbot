import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/app-components/ui/tooltip"
import {FormControl, FormItem, FormLabel, FormMessage} from "@/app-components/ui/form"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/app-components/ui/select"
import {AppFormItem} from "./types"
import {AppFormFieldProps} from "../AppFormField"
import {FlexRow} from "@/app-components/FlexRow";
import infoIcon from '@/assets/svg_icons/info.svg'

export interface AppSelectItem {key?: any, title: string, value: any}

export interface AppSelectProps { items: AppSelectItem[] }

export function AppSelect({field, label, items = [], placeholder, info}: AppFormItem & AppFormFieldProps & AppSelectProps) {

    return (
        <FormItem>

            <FlexRow className="justify-between items-center">
                <FormLabel>{label}</FormLabel>
                { info &&
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild className="">
                                <img src={infoIcon} alt="info" className={`cursor-pointer`} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{info}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                }
            </FlexRow>

            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder={placeholder}/>
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {items.map((x, i) => (
                        <SelectItem key={i} value={x.value}>{x.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>


            <FormMessage/>

        </FormItem>

    )
}
