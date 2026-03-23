import Dashboard from '@/app-screens/Dashboard';
import { NavigationTree } from '../types';
import EligibilityMatrix from '@/app-screens/EligibilityMatrix';
import Appointments from '@/app-screens/Applications';
import CreateAppointment from '@/app-screens/Applications/create';
import CompleteAppointmentBooking from '@/app-screens/Applications/complete';
import AllApplications from "@/app-screens/Applications/Applications";
import ServiceArea from '@/app-screens/Accounts/ServiceArea';
import { Navigate } from 'react-router-dom'

const navigationConfig: NavigationTree[] = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/",
    element: <Navigate to={"/dashboard"} />,
  },
  {
    path: "/eligibility-matrix",
    element: <EligibilityMatrix />,
  },
  {
    path: "/appointments/create",
    element: <CreateAppointment />,

  },
  {
    path: "/appointments/complete",
    element: <CompleteAppointmentBooking />,
  },
  {
    path: "/applications",
    element: <AllApplications />,
  },

  {
    path: "/account/service-area",
    element: <ServiceArea />,
  },


];
export default navigationConfig;

