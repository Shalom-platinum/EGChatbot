import { cn } from "@/utils/utils"
import { FC } from "react";
import { ClassnameProps } from "@/app-model/BaseProps";
import { FlexCol } from "./FlexCol";
import up from '@/assets/svg_icons/up.svg';

export interface AppStatCardProps extends ClassnameProps {
  title: string;
  count: string;
  comment?: string;
}
export const AppStatCard: FC<AppStatCardProps> = ({ className, title, count }) => {
  return (
    <FlexCol className={cn('rounded-md bg-white p-5 gap-3', className)}>
      <p className=" text-sm">{title}</p>
      <p className=" text-[#0092FF] text-3xl font-bold">{count}</p>
      <p className="text-sm text-[#7B7B7B] align-middle">
        {/* <img src={up} className="inline-block align-middle" /> */}
        {/* <span className="align-middle pl-1">10% Since last month</span> */}
      </p>
    </FlexCol>


  )
}