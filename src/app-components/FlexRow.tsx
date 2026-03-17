import { cn } from "@/utils/utils"
import { FC } from "react";
import { ClassnameChildrenProps } from "@/app-model/BaseProps";


export const FlexRow: FC<ClassnameChildrenProps> = ({ className, children }) => {
        return (
                <div className={cn(`flex flex-row gap-0 ${className}`)}>
                        {children}
                </div>
        )
}