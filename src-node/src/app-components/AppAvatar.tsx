import { cn } from "@/utils/utils"
import { SidebarTrigger } from "./ui/sidebar"
import { FC } from "react";
import { FlexRow } from "./FlexRow";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ClassnameChildrenProps, ClassnameProps } from "@/app-model/BaseProps";

export interface AppAvatarProps extends ClassnameProps {
  initials?: string;
  imgSrc?: string;
}
export const AppAvatar: FC<AppAvatarProps> = ({ initials, imgSrc }) => {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>{initials || 'CN'}</AvatarFallback>
    </Avatar>


  )
}