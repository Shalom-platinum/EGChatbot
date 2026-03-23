import { FlexCol } from '@/app-components/FlexCol';
import { FlexRow } from '@/app-components/FlexRow';
import { Button } from '@/app-components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/app-components/ui/form';
// TODO: Import individual forms: FORM1, FORM2, FORM3 as LAZY

import { AppSteps } from '@/app-components/AppSteps';
import { lazy, Suspense, useState } from 'react';
import useSteps from '@/app-framework/hooks/useSteps';
import { AppSpinner } from '@/app-components/AppSpinner';
import { AppDialog } from '@/app-components/AppDialog';
import { useNavigate } from 'react-router';
import { useMsal } from "@azure/msal-react";
import { api } from '@/app-services/auth.service'
import { toast } from "react-toastify";
import { IEligibilityMatrix } from "@/app-services/@types/types.ts";

const Form1 = lazy(() => import("./CRAEligibility"));
const Form2 = lazy(() => import("./IntentEligibility"));
const Form3 = lazy(() => import("./InclusiveEligibility"));


function EligibilityMatrix() {
    const { accounts } = useMsal()
    const { isLastStep, isFirstStep, activeStep, length, moveTo } = useSteps({ length: 3 });
    const [open, setIsOpen] = useState(false);
    const nav = useNavigate();

    const [trigger] = api.useEligibilityMatrixMutation()
    const SubmitEligibilityMatrixFN = async (value: IEligibilityMatrix) => {
        try {
            const res = await trigger(value).unwrap()
            if (res.status) {
                toast.success("Eligibility Matrix submitted successfully!!")
                setIsOpen(true);
            }
        } catch (e) {
            console.error(e)
        }
    }

    const ModalContentSuccess = () => {
        return (
            <FlexCol className='gap-10  items-center'>
                <h2 className='heading font-bold text-2xl'>Success</h2>
                <p>You are confirmed and Eligible</p>
                <Button onClick={() => nav('/dashboard')}>Back To Dashboard</Button>
                <p className="text-xl">👍</p>
            </FlexCol>
        )
    }
    const formSchema = z.object({
        customerEmail: z.string().min(2),
        isBCResident: z.coerce.boolean({ message: "This is a mandatory field" }),
        isCAPRResident: z.coerce.boolean({ message: "This is a mandatory field" }),
        unEmployedOrPE: z.coerce.boolean({ message: "This is a mandatory field" }),
        assistToAdvCareer: z.coerce.boolean({ message: "This is a mandatory field" }),
        seekingEmployment: z.coerce.boolean({ message: "This is a mandatory field" }),
        seekingSelfEmployment: z.coerce.boolean({ message: "This is a mandatory field" }),
        requireService: z.coerce.boolean({ message: "This is a mandatory field" }),
        isDisabilibilty: z.coerce.boolean({ message: "This is a mandatory field" }),
        isBtw16To29: z.coerce.boolean({ message: "This is a mandatory field" }),
        isPastAbuse: z.coerce.boolean({ message: "This is a mandatory field" }),
        isMultiplebarrier: z.coerce.boolean({ message: "This is a mandatory field" }),
        isEligibileForCLBC: z.coerce.boolean({ message: "This is a mandatory field" }),
        isReferredByCLBC: z.coerce.boolean({ message: "This is a mandatory field" }),
        isAge19: z.coerce.boolean({ message: "This is a mandatory field" }),
    })

    const form_1_Schema = z.object({
        customerEmail: z.string().min(2),
        isBCResident: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
        isCAPRResident: z.enum(["Yes", "No"], { message: "This is a mandatory field" })
    }).required()

    const form_2_Schema = z.object({
        unEmployedOrPE: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
        assistToAdvCareer: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
        seekingEmployment: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
        seekingSelfEmployment: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
        requireService: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
    })

    const form_3_Schema = z.object({
        isDisabilibilty: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
        isBtw16To29: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
        isPastAbuse: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
        isMultiplebarrier: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
        isEligibileForCLBC: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
        isReferredByCLBC: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
        isAge19: z.enum(["Yes", "No"], { message: "This is a mandatory field" }),
        checkPolicy: z.boolean().refine(value => value === true, { message: 'Checkbox must be checked' })
    })

    const schemaSwitch = [form_1_Schema, form_2_Schema, form_3_Schema]

    // 1. Define your form.
    const form = useForm<z.infer<typeof schemaSwitch[0]>>({
        resolver: zodResolver(schemaSwitch[activeStep - 1]),
        defaultValues: {
            customerEmail: accounts[0].username,
            // isBCResident: "",
            // isCAPRResident: "",
            // unEmployedOrPE: "",
            // assistToAdvCareer: "",
            // seekingEmployment: "",
            // seekingSelfEmployment: "",
            // requireService: "",
            // isDisabilibilty: "",
            // isBtw16To29: "",
            // isPastAbuse: "",
            // isMultiplebarrier: "",
            // isEligibileForCLBC: "",
            // isReferredByCLBC: "",
            // isAge19: ""
        },
    })


    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values, isLastStep);
        if (!isLastStep) return moveTo(activeStep + 1);


        const convertYesNoToBoolean = (obj) => {
            const result = {};
            for (const key in obj) {
                if (key !== "checkPolicy") {
                    if (obj[key] === "Yes") {
                        result[key] = true;
                    } else if (obj[key] === "No") {
                        result[key] = false;
                    } else {
                        result[key] = obj[key];
                    }
                }
            }
            return result;
        };
        const convertedData = convertYesNoToBoolean(form.getValues());
        console.log(convertedData)
        // @ts-ignore
        SubmitEligibilityMatrixFN(convertedData)
        form.reset()
    }

    return (

        <main className='w-full '>
            <FlexRow className='my-5 gap-5  text-[#0092FF]'>
                <p>Service Eligibility Matrix </p>
                {/* <p>Service Area</p> */}
            </FlexRow>

            <FlexCol className='gap-10 bg-white p-10'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        <FlexRow className=' w-full min-h-20 gap-7'>
                            <div className='w-[10vw]'>
                                <AppSteps length={length} currentStep={activeStep} move={moveTo} />
                            </div>
                            <div className='w-full'>
                                <Suspense fallback={<AppSpinner className={undefined} />}>
                                    {activeStep === 1 && <Form1 form={form} />}
                                    {activeStep === 2 && <Form2 form={form} />}
                                    {activeStep === 3 && <Form3 form={form} />}
                                </Suspense>
                            </div>

                        </FlexRow>

                        <FlexRow className='relative gap-3 justify-end'>
                            {activeStep > 1 && (
                                <Button variant='secondary' onClick={() => moveTo(activeStep - 1)}>Previous</Button>)}
                            <Button type={'submit'} className='bg-[#0092FF]'
                            // onClick={() => {
                            //   isLastStep ? null : moveTo(activeStep + 1);
                            // }}

                            >{isLastStep ? 'Submit' : 'Next'}</Button>
                        </FlexRow>

                    </form>
                </Form>

                <AppDialog open={open} onOpenChange={setIsOpen}
                    w='sm'
                    disableHeader={true}
                    disableFooter={true}
                    body={
                        <ModalContentSuccess />
                    } />

            </FlexCol>

        </main>


    )
}

export default EligibilityMatrix;

