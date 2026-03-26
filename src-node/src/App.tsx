import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import authRoutes from "@/app-routes/routes/auth.routes"
import dashboardRoutes from "@/app-routes/routes/dashboard.routes"
import ProtectedRoute from '@/app-routes/ProtectedRoute';
import Error from './Error';
import { IPublicClientApplication } from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import Login from './app-screens/Auth/Login';
import SignUp from "@/app-screens/Auth/SignUp";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'

type AppProps = {
  pca: IPublicClientApplication;
};

function App({ pca }: AppProps) {

  const { accounts, inProgress } = useMsal();
  const routes = createBrowserRouter(
    [
      {
        path: "/",
        element: <ProtectedRoute navigateTo={'/login'} condition={false} isLoading={inProgress === 'login'} />,
        children: [
          ...dashboardRoutes,
        ] as any[],
        errorElement: <Error />
      },
      {
        path: "*",
        element: <Login />
      },
      {
        path: "/login",
        element: <Login />
      }, {
        path: "/signup",
        element: <SignUp />
      },
    ]
  )

  return (
    <MsalProvider instance={pca}>
      <ToastContainer autoClose={2000} closeOnClick />
      <RouterProvider router={routes} />
    </MsalProvider>
  )

}

export default App
