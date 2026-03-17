import { OidMember } from "@/app-model/OidMember"
import { ProfileStateArr } from "@/app-store/profile.slice"

export type UserProfileResponse ={
        user: {
            _id: OidMember,
            category: "",
            category_a: string,
            date_of_birth:string,
            department: string,
            department_code: string,
            designation: string,
            gender: "Female" | "Male",
            is_employee: boolean,
            is_patient: boolean,
            job_title: string,
            location: string,
            nationality: string,
            reporting_to: string,
            status: string,
            age: number
        },
        profiles: ProfileStateArr
        
}