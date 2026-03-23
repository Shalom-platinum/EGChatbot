import {Fragment} from "react";
import {Navigate, Outlet, Route} from "react-router";
import {AuthenticatedTemplate, UnauthenticatedTemplate} from "@azure/msal-react";
import DashboardContainer from "@/app-containers/DashboardContainer";
import {AppSpinner} from "@/app-components/AppSpinner";
import {AppAlert} from "@/app-components/AppAlert";

const ProtectedRoute = ({navigateTo, condition, isLoading}: {
    navigateTo: string,
    condition: boolean,
    isLoading: boolean
}) => {

    console.log(navigateTo, condition, "_condition");

    if (isLoading) {
        return (
            <div className='flex h-[80vh] items-center justify-center'>
                <AppSpinner className={'text-red-800'}/>
            </div>)
    }

    return (

        <Fragment>
            <AuthenticatedTemplate>
                <DashboardContainer>
                    <Outlet/>
                </DashboardContainer>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <Navigate to={navigateTo} replace={true}/>
            </UnauthenticatedTemplate>
        </Fragment>
    )

    // return (
    // )
}


export default ProtectedRoute;