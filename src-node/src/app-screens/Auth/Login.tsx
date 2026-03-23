import { Link, useNavigate } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { toast } from "react-toastify";
import { Button } from '@/app-components/ui/button';
import { useEffect, useState } from "react";
import { getAccessToken, loginRequest } from '@/app-config/msalConfig';
import { AuthStrategy } from '@/app-framework/AuthCacheHelpers';
import useAuth from '@/app-framework/hooks/useAuth';

function Login() {
    const navigate = useNavigate();



    const { instance, accounts } = useMsal();
    const { setTokenOnly, attemptAuth } = useAuth()

    // @ts-ignore
    const loginUser = async () => {
        try {

            const msal = await instance.loginPopup(loginRequest);
            // Get profile from Mary and populate; If it fails quit auth action;
            localStorage.setItem("Token", msal.accessToken);
            setTokenOnly({ token: msal.accessToken, strategy: AuthStrategy.AZUREAD });
            // const profile = await query({}).unwrap();
            // const { lastName, firstName, id } = (profile?.content?.adminUser || {})
            // const permissions = profile?.content?.permissions || [];
            // console.log(permissions);

            attemptAuth({
                user: { email: msal.account.username, lastName: '', firstName: '', userId: 0 },
                token: msal.accessToken,
                strategy: AuthStrategy.AZUREAD,
                permissions: [],
            })

            toast.success('Login Successful');

            navigate('/dashboard', { replace: true })
        } catch (error) {
            toast.error('You currently don\'t have access to view the app. Contact Admin.')

        }

    }

    return (
        <main className='w-full h-screen flex bg-no-repeat bg-cover'>
            <section
                className='invisible basis-full bg-registration flex-col gap-5 bg-cover bg-no-repeat lg:basis-3/5 flex justify-center p-20'>
                <h1 className=' text-3xl text-white'>Experience hassle-free scheduling at your fingertips—make booking
                    appointments a joy!</h1>
            </section>
            <section className='basis-2/5 px-10 flex flex-col gap-20'>
                <div className='flex w-full basis-1/5 h-[100px] bg-[] content-center justify-end items-center'>
                    {/* <img src={reliance} className='w-[150px] h-[50px] ' /> */}
                </div>
                <div className='basis-4/5 flex flex-col gap-3 w-[90%]'>
                    <h2 className=' text-2xl'>Sign In</h2>
                    <p className='text-[#8E8E8E]'>Please sign in to your account</p>

                    {/* <img src={sparrow} className='h-auto w-full' /> */}
                    {/* Add exisitng accounts here*/}
                    <Button className='!bg-[#0CB3EE] w-full !text-white !capitalize !py-5' onClick={() => { loginUser() }}>Sign in</Button>

                    <p className='text-[#C90206] mt-5'>
                        <span className={"underline"}>Don't have an account?</span>
                        <Link className={"ml-3"} to={"/signup"}>Sign Up</Link>
                    </p>

                </div>

            </section>
        </main>
    )
}

export default Login