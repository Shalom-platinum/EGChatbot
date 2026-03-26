import Dashboard from '@/app-screens/Dashboard';
import { NavigationTree } from '../types';
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
 

];
export default navigationConfig;

