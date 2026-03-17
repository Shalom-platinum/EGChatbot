// import AdminNavbar from '@/app-components/Navbar/AdminNavbar'
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useNavigation, useParams } from 'react-router'
import { SidebarProvider, SidebarTrigger } from "@/app-components/ui/sidebar"
import { AppSidebar } from '@/app-components/AppSidebar';
import { AppNavbar } from '@/app-components/AppNavbar';
import { FlexRow } from '@/app-components/FlexRow';
import { FlexCol } from '@/app-components/FlexCol';
import { AppAlert } from '@/app-components/AppAlert';
// import { AppSidebar } from "@/app-components/app-sidebar"

const DashboardContainer: FC<PropsWithChildren<any>> = ({ children }) => {
  const nav = useNavigate();
  const location = useLocation();

  
  return (
    <SidebarProvider>
      <FlexRow className='w-full'>
        {/* <AppSidebar /> */}
        <div className='flex-1 bg-[#F8FAFB]'>
          {/* <AppNavbar /> */}
          {/* {location.pathname === '/dashboard' && <AppAlert className={undefined} action={() => nav('/eligibility-matrix')}/>} */}
          <main className='flex-1 container py-5'>
            {children}
          </main>
        </div>

      </FlexRow>
    </SidebarProvider>





  )
}

export default DashboardContainer