import {cn} from "@/utils/utils"
import {FC} from "react";
import {ClassnameChildrenProps} from "@/app-model/BaseProps";

export const FlexCol: FC<ClassnameChildrenProps> = ({className, children}) => {
    return (
        <div className={cn(`flex flex-col`, className)}>
            {children}
        </div>
    )
}