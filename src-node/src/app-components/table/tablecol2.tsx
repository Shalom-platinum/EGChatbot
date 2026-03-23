// @ts-nocheck
import {ColumnDef} from "@tanstack/react-table"
import {ArrowUpDown} from "lucide-react"
import {Checkbox} from "@/app-components/ui/checkbox"
import {Button} from "@/app-components/ui/button"
import image from '@/assets/svg_icons/elena.svg'
import trash from '@/assets/svg_icons/trash.png'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type TProps = {
    staffMember: string
    dateOfAppointment: string
    from: string
    to: string
    type: string
    status: string
}

export const tablecol: ColumnDef<TProps>[] = [
    {
        id: "select",
        header: ({table}) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({row}) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "staffMember",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    className="px-0"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Staff Member
                    <ArrowUpDown className="w-4 h-4 ml-2"/>
                </Button>
            )
        },
        cell: ({row}) => {
            return <div className={`flex items-center gap-x-10`}><img src={image} alt=""/> {row.getValue("staffMember")}
            </div>
        }
    },
    {
        accessorKey: "dateOfAppointment",
        header: () => <p className={``}>Date Of Appointment</p>,
        cell: ({row}) => {
            return <>{new Date(row.getValue("dateOfAppointment")).toLocaleDateString()}</>
        }
    },
    {
        accessorKey: "from",
        header: "From",
    },
    {
        accessorKey: "to",
        header: "To",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({row}) => {
            const status = row.getValue("status");
            return <div
                className={`p-1 rounded-full text-center flex items-center justify-center font-semibold text-Yellow gap-x-2`}> {status as any}</div>
        }
    },
    // {
    //     id: "action",
    //     header: () => <>Action</>,
    //     cell: ({row}) => {
    //         return (
    //             <Button variant="ghost" onClick={() => alert}>
    //                 <img src={trash} alt=""/>
    //             </Button>
    //         )
    //     }
    // }

]
