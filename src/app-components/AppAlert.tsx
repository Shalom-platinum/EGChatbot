import { ClassnameProps } from "@/app-model/BaseProps";
import { cn } from "@/utils/utils"
import { FlexRow } from "./FlexRow";
import { Button } from "./ui/button";
import { FaCalendarCheck } from "react-icons/fa6";
import { useMsal } from "@azure/msal-react";
import { api } from "@/app-services";

export interface AppAvatarProps extends ClassnameProps {
    message: string;
    action?: () => void;
}
export const AppAlert = ({ className, action }) => {

    const { accounts } = useMsal();
    const Email = accounts[0]?.username ?? "";
    const { data } = api.useGetCustomerEligibilityQuery({email: Email},)

    if (data?.status) {
        return null;
    }

    return (
        <FlexRow className={cn('bg-[#FFE53573] py-3 px-5 items-center justify-between', className)}>
            <p className=" text-[#464255]">
                <FaCalendarCheck className=" inline-block align-middle" />
                <span className="ml-3 align-middle">{accounts[0]?.name ?? "John Doe"}, please confirm your service eligibility matrix</span>
            </p>
            <Button onClick={action}>Complete Now</Button>
        </FlexRow>)
}