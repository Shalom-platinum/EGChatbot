import { tablecol, TProps } from "@/app-components/table/tablecol2";
import { DataTable } from "@/app-components/table/reusabletable";
import { Button } from "@/app-components/ui/button";
import { Input } from "@/app-components/ui/input";
import trash from '@/assets/svg_icons/trash.png'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app-components/ui/select"
import { useNavigate } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { AppDialog } from "@/app-components/AppDialog";
import { FlexCol } from "@/app-components/FlexCol";
import { SCMSapi } from "@/app-services/auth.serviceSCMS";
import { getEmail } from "@/utils/getEmail";
import { LoaderCircle } from "lucide-react";
import { AuthenticatedTemplate, useMsal } from "@azure/msal-react";


const AllApplications = () => {
    const { instance } = useMsal();

    const email = getEmail()

    const { data: AppsData, isFetching, isSuccess } = SCMSapi.useGetAppsQuery({ email: email })
    console.log(AppsData);


    const nav = useNavigate();
    const [open, setIsOpen] = useState(false);
    const tableWithAction: ColumnDef<TProps>[] = [...tablecol,
    {
        id: "action",
        header: () => <>Action</>,
        cell: ({ row }) => {
            return (
                <Button variant="ghost" onClick={() => setIsOpen(true)}>
                    <img src={trash} alt="" />
                </Button>
            )
        }
    }
    ];
    // const ModalConfirmation = () => {
    //     return (
    //         // <FlexCol className="flex items-center justify-center">
    //         <FlexCol className="bg-white p-6 w-full text-center items-center justify-center">
    //             <div className="text-red-500 text-4xl mb-4">
    //                 <i className="fas fa-exclamation-circle"></i>
    //             </div>
    //             <h2 className="text-xl font-bold text-gray-800">Wait!</h2>
    //             <p className="text-gray-500 mt-2">Are you sure you want to delete this booking?</p>
    //             <div className="mt-6 flex gap-5 justify-between">
    //                 <button
    //                     onClick={() => setIsOpen(false)}
    //                     className="bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded hover:bg-gray-200 transition"
    //                 >
    //                     Cancel
    //                 </button>
    //                 <button
    //                     onClick={() => setIsOpen(false)}
    //                     className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition"
    //                 >
    //                     Yes Delete
    //                 </button>
    //             </div>
    //         </FlexCol>
    //     )
    // }

    //@ts-ignore
    const handleAppClick = async (appUrl) => {
        try {
            // Check if user is authenticated
            const accounts = instance.getAllAccounts();

            if (accounts.length > 0) {
                // User is authenticated, just navigate
                // The other app will handle SSO automatically
                window.location.href = appUrl;
            } else {
                // User not authenticated (shouldn't happen, but safety check)
                await instance.loginRedirect();
            }
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    return (
        <>
            <AuthenticatedTemplate>

                <p className={`mb-5`}>Applications</p>

                <div className={`bg-white p-5 rounded-lg space-y-2 min-h-[50vh] `}>
                    <div className="grid grid-cols-12 gap-5">
                        {AppsData && AppsData.map((item, index) => {
                            if (item.status.toLowerCase() === "active") {
                                return (
                                    <div onClick={() => handleAppClick(item?.url)} key={item + index} className="col-span-2 h-[100px] flex items-center justify-center border font-bold border-blue-600 rounded-lg shadow-sm hover:text-white hover:bg-blue-600 transition-all duration-300 cursor-pointer">
                                        {item.app}
                                    </div>
                                )
                            }
                        })}
                        {AppsData && AppsData.length === 0 && !isFetching && <div className="col-span-12 flex items-center justify-center">No Applications Found for current user</div>}
                        {isFetching && <p><LoaderCircle className="animate-spin size-10 text-primary" /></p>}
                    </div>
                </div>
            </AuthenticatedTemplate>

        </>
    )
}

export default AllApplications;