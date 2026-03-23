import * as React from 'react'
import {Link, useNavigate} from 'react-router-dom';
import {Button} from '@/app-components/ui/button';
import {Form} from '@/app-components/ui/form';
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {AppFormField} from "@/app-components/AppFormField";
import {AppPasswordInput} from "@/app-components/form/AppPasswordInput";
import {api} from '@/app-services/auth.service'
import {values} from "lodash";
import {ICreateCustomerRequest} from "@/app-services/@types/types";
import {toast} from "react-toastify";

function SignUp() {

    const nav = useNavigate();


    const formSchema = z.object({
        firstName: z.string().min(2, {
            message: "Username must be at least 2 characters.",
        }),
        lastName: z.string().min(2, {
            message: "Username must be at least 2 characters.",
        }),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8).refine((password) => {
            const hasUppercase = /[A-Z]/.test(password);
            const hasLowercase = /[a-z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            return hasUppercase && hasLowercase && hasNumber;
        }, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
        },
    })

    const [trigger, {isSuccess, isLoading}] = api.useCreateCustomerMutation()
    // @ts-ignore
    const CreateAccount = async (values: ICreateCustomerRequest) => {
        try {
            const result = await trigger(values).unwrap()
            console.log(result)
            if (result.description.toLowerCase() == "sucess") {
                toast.success("Account Creation Sucessful!!")
                nav("/login")
            }
        } catch (e) {
            console.error(e)
        }
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        CreateAccount(values)
    }

    return (

        <main className='w-full h-screen flex bg-no-repeat bg-cover'>
            <section
                className='basis-full bg-registration flex-col gap-5 bg-cover bg-no-repeat lg:basis-3/5 flex justify-center p-20'>
                <h1 className=' text-3xl text-white'>Experience hassle-free scheduling at your fingertips—make booking
                    appointments a joy!</h1>
            </section>
            <section className='basis-3/5 px-10 flex flex-col justify-center gap-20'>
                <div className='basis-4/5 flex flex-col gap-3 w-[90%] lg:mt-20'>
                    <h2 className=' text-2xl'>Sign Up</h2>
                    <div className='w-full'>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <section className='grid grid-cols-2 gap-7'>
                                    <div className="col-span-2">
                                        <AppFormField form={form} name={'firstName'} label={'First Name'}
                                                      placeholder={'John'}/>
                                    </div>
                                    <div className="col-span-2">
                                        <AppFormField form={form} name={'lastName'} label={'Last Name'}
                                                      placeholder={'Doe'}/>
                                    </div>
                                    <div className="col-span-2">
                                        <AppFormField form={form} name={'email'} label={'Email Address'}
                                                      placeholder={'name@example.com'}/>
                                    </div>
                                    <div className="col-span-2">
                                        <AppFormField Component={AppPasswordInput} form={form} name={'password'}
                                                      label={'Password'} placeholder={'********'}/>
                                    </div>
                                </section>
                                <Button disabled={isLoading} type={"submit"}
                                        className='!bg-[#0CB3EE] w-full !text-white !capitalize !py-5'
                                        onClick={() => {
                                        }}>{isLoading ? "..." : "Create Account"}</Button>
                            </form>

                            <p className='text-[#C90206] mt-5'>
                                <span className={"underline"}>Already have an account?</span>
                                <Link className={"ml-3"} to={"/login"}>Login</Link>
                            </p>
                        </Form>
                    </div>
                </div>
            </section>
        </main>


    )
}

export default SignUp