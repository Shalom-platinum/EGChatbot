import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app-components/ui/sidebar"
import { sidebarMenu } from "@/app-model/nav.data";
import app_logo from '@/assets/svg_icons/app_logo.svg';
import { FaGear } from "react-icons/fa6";
import { Link, NavLink } from "react-router-dom";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className=" w-28">
        <img src={app_logo} />
      </SidebarHeader>
      <SidebarContent className="bg-white p-3 py-5">
        {/* <SidebarGroup />
          <SidebarGroup /> */}
        <SidebarMenu>
          {sidebarMenu.map((x, i) => (
            <SidebarMenuItem key={i} className="">
              <SidebarMenuButton asChild className="h-[50px] gap-5  text-base">
                <NavLink to={x.path}>
                  {x.icon}
                  <span>{x.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

      </SidebarContent>
      <SidebarFooter >
        <SidebarMenuButton asChild className="gap-5  text-base">
          <NavLink to={'/account/service-area'}>
            <FaGear />
            <span>My Account</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
