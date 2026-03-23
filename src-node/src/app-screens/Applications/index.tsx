import { useMsal } from '@azure/msal-react';
import { FlexCol } from '@/app-components/FlexCol';
import { FlexRow } from '@/app-components/FlexRow';
import { Button } from '@/app-components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/app-components/ui/form';
// TODO: Import individual forms: FORM1, FORM2, FORM3 as LAZY

import useSteps from '@/app-framework/hooks/useSteps';
import ServiceArea from './ServiceArea';
import { useNavigate } from 'react-router';


function Appointments() {
  const { instance, accounts, inProgress } = useMsal();
  const { isLastStep, isFirstStep, activeStep, length, moveTo } = useSteps({ length: 3 });
  const nav = useNavigate();

  const formSchema = z.object({
    First: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
  })

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      First: "",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }


  return (

    <main className='w-full'>
      <FlexRow className='my-5 gap-5  text-[#0092FF]'>
        <p>Service Area </p>
      </FlexRow>

      <FlexCol className='gap-10 bg-white p-10'>
        <FlexRow className=' w-full min-h-20 gap-7'>
          {/* <div className='w-[10vw]'>
            <AppSteps length={length} currentStep={activeStep} move={moveTo} />
          </div> */}
          <div className='w-full'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               <ServiceArea form={form}/>
              </form>
            </Form>
          </div>

        </FlexRow>

        <FlexRow className='relative gap-5 justify-end items-center'>
          <p className='text-[#FF0000]'>Can’t find a closer office?</p>
          <Button className='bg-[#0092FF]' onClick={() => {nav('/appointments/create')}}>{'Confirm'}</Button>
        </FlexRow>

      </FlexCol>

    </main>


  )
}

export default Appointments;

