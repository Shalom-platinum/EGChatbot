import { useMsal } from '@azure/msal-react';
import { FlexCol } from '@/app-components/FlexCol';
import { FlexRow } from '@/app-components/FlexRow';
import { Button } from '@/app-components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormLabel } from '@/app-components/ui/form';
// TODO: Import individual forms: FORM1, FORM2, FORM3 as LAZY

import useSteps from '@/app-framework/hooks/useSteps';
import ServiceArea from './ServiceArea';
import { AppFormField } from '@/app-components/AppFormField';
import { useEffect, useState } from 'react';
import { Calendar } from '@/app-components/ui/calendar';
import { ScrollArea } from '@/app-components/ui/scroll-area';
import { Checkbox } from '@/app-components/ui/checkbox';
import { FaArrowLeft, FaCalendar, FaCamera, FaClock } from 'react-icons/fa6';
import { useNavigate } from 'react-router';
import { dummy_offices } from '@/app-model/options.data';
import { AppTextArea } from '@/app-components/form/AppTextArea';
import { AppDialog } from '@/app-components/AppDialog';

const dates = ['10:00', '11:00', '13:30', '14:30', '17:30', '08:00', '00:00', '01:30',
  // '10:00', '11:00', '13:30', '14:30', '17:30', '08:00', '00:00', '01:30'
]
function CompleteAppointmentBooking() {
  const { instance, accounts, inProgress } = useMsal();
  const { isLastStep, isFirstStep, activeStep, length, moveTo } = useSteps({ length: 3 });
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [open, setIsOpen] = useState(false);

  useEffect(()=>{
    // if(!open)
  }, [open]);
  
  const nav = useNavigate()

  const formSchema = z.object({
    comment: z.string().min(2, {
      message: "Comment must be at least 2 characters.",
    }),
  })

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: 'Type a comment'
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    setIsOpen( true);
  }


  const ModalConfirmation = () => {
    return(
      <FlexCol className="items-center justify-center p-4">
      <div className="bg-white p-8 max-w-sm w-full text-center">
        <div className="text-green-500 text-5xl mb-4">
          <i className="fas fa-calendar-check"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Wohoo! Your booking has been Confirmed</h2>
        <p className="text-gray-500 mt-2">A meeting link has been sent to your email.</p>
        <FlexCol className="mt-6 gap-3">
          <p className="text-gray-800 font-medium">Virtual Meeting</p>
          <p className="text-xl font-bold text-gray-800">10AM GMT+5 | Helena Weber</p>
          <p className="text-gray-500">Thursday October 6, 2024</p>
          <p className="text-gray-500">Valley Road Clearwater Branch | BC Canada</p>
        </FlexCol>
        <Button
        onClick={() => nav('/appointments/create')}
          className='my-5'
        >
          Book another Appointment
        </Button>
      </div>
    </FlexCol>
    )
  }

  return (

    <main className='w-full '>
      <FlexRow className='my-5 gap-5  text-[#0092FF]'>
        <Button onClick={() => nav(-1)} variant='link'><FaArrowLeft /> Go Back </Button>
      </FlexRow>

      <FlexCol className='gap-10 '>

        <FlexRow className='w-full min-h-20 gap-5'>
          <FlexCol className='bg-white p-7 w-[30%] h-max gap-3'>
            <p>Helena Webber</p>
            <h2 className='text-[#808080] text-2xl font-bold'>Meeting</h2>
            <FlexRow className='items-center gap-3'><FaClock /> <p>30 Mins</p></FlexRow>
            <FlexRow className='items-center gap-3'><FaCamera /> <p>Virtual</p></FlexRow>
            <FlexRow className='items-center gap-3'><FaCalendar /> <p>{new Date().toDateString()}</p></FlexRow>
          </FlexCol>


          <div className=' bg-white p-7 w-full'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FlexCol className='gap-7'>
                  <div>
                    <h2 className=' text-2xl mb-1'>Complete your Information</h2>
                  </div>

                  <FlexCol className='gap-5'>
                    <section className='grid md:grid-cols-2 grid-flow-row grid-cols-1 gap-5'>
                      <AppFormField form={form} name={'firstName'} label={'First Name'} placeholder={'Abdulmalik'} disabled />
                      <AppFormField form={form} name={'lastName'} label={'Last Name'} placeholder={'Abdulgaffar'} disabled />
                      <AppFormField form={form} name={'email'} label={'Email Address'} placeholder={'abdulgaffar@relianceinfosystems.com'} disabled />
                      <AppFormField form={form} name={'phone'} label={'Phone Number'} placeholder={'Phone Number'} />
                    </section>
                    <AppFormField form={form} name={'location'} label={'Selected Location'} placeholder={dummy_offices[0].title} disabled />
                    <AppFormField form={form} name={'comment'} label={'Notes'} placeholder={'Type here...'} Component={AppTextArea} />
                  </FlexCol>

                  <FlexRow className='gap-3 items-center content-center'>
                    <AppFormField form={form} name={'checkPolicy'} placeholder={'ns'} Component={Checkbox} />
                    <FormLabel htmlFor='checkPolicy'>
                      <p>
                        Get a follow up call prior to your appointment
                      </p>
                    </FormLabel>
                  </FlexRow>
                  <FlexRow className='justify-end'>
                    <Button type='submit'>Book Appointment</Button>
                  </FlexRow>
                </FlexCol>


              </form>
            </Form>
          </div>

        </FlexRow>


        <AppDialog open={open} onOpenChange={setIsOpen}
          w='lg'
          disableHeader={true}
          disableFooter={true}
          body={
            <ModalConfirmation />
          } />
      </FlexCol>

    </main>


  )
}

export default CompleteAppointmentBooking;

