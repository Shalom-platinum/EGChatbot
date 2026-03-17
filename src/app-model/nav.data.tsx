import { ReactElement, ReactNode } from "react";
import {FaCalendarCheck, FaDashcube} from 'react-icons/fa6'
export interface SideBarMenuProps {
    key?: string
    path: string
    title?: string;
    subMenu?: SideBarMenuProps[],
    icon?: ReactNode;
}
export const sidebarMenu: SideBarMenuProps[] = [
    {
        path: "/dashboard",
        title: "Dashboard",
        icon: <FaDashcube/>
        
    },
    {
        path: "/applications",
        title: "Applications",
        icon: <FaDashcube/>
    }

]