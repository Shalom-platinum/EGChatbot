import { SidebarTrigger } from "./ui/sidebar"
import { FC } from "react";
import { FlexRow } from "./FlexRow";
import { AppAvatar } from "./AppAvatar";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/app-components/ui/navigation-menu"
import { useNavigate } from "react-router-dom";
import Auth from '@/app-config/Auth'
import { loginRequest } from "@/app-config/msalConfig";
import { getEmail } from "@/utils/getEmail";

export interface AppNavbarProps {
    className?: string;
    email?: string;
    username?: string;
}

export const AppNavbar: FC<AppNavbarProps> = ({ className }) => {
    const nav = useNavigate();

    const { instance, accounts, inProgress } = useMsal();
    const auth = new Auth()

    // @ts-ignore
    const Login = async () => {
        try {
            await instance.loginPopup(loginRequest);
            nav("/dashboard")
        } catch (error) {
            console.error(error);
        }
    }

    // @ts-ignore
    const Logout = async () => {
        try {
            await instance.logoutPopup();
            nav("/login")
        } catch (error) {
            console.error(error);
        }
    }

    const email = getEmail()


    return (
        <nav className="w-full bg-white border-[#50505033] border-b-[1px] px-5">
            <FlexRow className="h-[70px]  justify-between items-center">
                <SidebarTrigger />
                <FlexRow className="gap-3">
                    <AppAvatar />
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>
                                    <div className='text-start text-sm'>
                                        <p className='font-semibold'>{accounts[0]?.name || "unknown"}</p>
                                        <p>{accounts[0]?.username || email || "name@example.com"}</p>
                                    </div>
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className='md:w-[200px] h-[50px] flex flex-col items-center justify-center '>
                                        <AuthenticatedTemplate>
                                            <button onClick={Logout}>Logout</button>
                                        </AuthenticatedTemplate>
                                        <UnauthenticatedTemplate>
                                            <button onClick={Login}>Login</button>
                                        </UnauthenticatedTemplate>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </FlexRow>
            </FlexRow>
        </nav>

    )
}