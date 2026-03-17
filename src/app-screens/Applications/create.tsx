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
import { AppFormField } from '@/app-components/AppFormField';
import { useState } from 'react';
import { Calendar } from '@/app-components/ui/calendar';
import { ScrollArea } from '@/app-components/ui/scroll-area';
import { useNavigate } from 'react-router';
import { AppSelect } from '@/app-components/form/AppSelect';
import { dummy_offices } from '@/app-model/options.data';
const dates = ['10:00', '11:00', '13:30', '14:30', '17:30', '08:00',
  // '00:00', '01:30', '10:00', '11:00', '13:30', '14:30', '17:30', '08:00', '00:00', '01:30'

]


function CreateAppointment() {
  const { instance, accounts, inProgress } = useMsal();
  const { isLastStep, isFirstStep, activeStep, length, moveTo } = useSteps({ length: 3 });
  const [date, setDate] = useState<Date | undefined>(new Date())
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

    <main className='w-full '>
      <FlexRow className='my-5 gap-5  text-[#0092FF]'>
        <p>Appointments </p>
      </FlexRow>

      <FlexCol className='gap-10 bg-white p-10'>
        <FlexRow className=' w-full min-h-20 gap-7'>
          <div className='w-full'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FlexCol className='gap-7'>
                  <h2 className=' text-2xl mb-1'>Book an Appointment</h2>


                  <section className='grid md:grid-cols-3 grid-flow-row grid-cols-1 gap-10 w-full'>
                    <FlexCol className='gap-5'>
                      <AppFormField form={form} name={'office'} label={'Office'} placeholder={dummy_offices[0].title} disabled />
                      <AppFormField form={form} name={'appointmentType'} label={'Appointment Type'} placeholder={'Apointmemnt Type'} Component={AppSelect}
                        items={[
                          { key: 0, value: 'Physical', title: 'Physical' },
                          { key: 1, value: 'Online', title: 'Online' },
                        ]} />
                      <AppFormField form={form} name={'staffMember'} label={'Staff Member'} placeholder={'Helena Weber'}
                        disabled
                        Component={AppSelect}
                        items={[
                          { key: 0, value: 'Physical', title: 'Helena Weber' },
                          { key: 1, value: 'Online', title: 'Wisdom Emmanuel' },
                        ]}
                      />
                    </FlexCol>

                    <FlexCol className='gap-5 col-span-2'>

                      <FlexRow className='gap-10 w-full'>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md border"
                        />
                        <FlexCol className='gap-5'>
                          <p>{date.toDateString()}</p>
                          <ScrollArea className='h-[300px]'>
                            <div className=' grid md:grid-cols-2 grid-flow-row w-full gap-5'>
                              {dates.map((x, i) => (
                                <Button variant='outline' className='px-3' key={i}>{x}</Button>
                              ))}
                            </div>
                          </ScrollArea>

                        </FlexCol>

                      </FlexRow>
                      <Button onClick={() => nav('/appointments/complete')}>Continue</Button>
                    </FlexCol>

                  </section>
                </FlexCol>


              </form>
            </Form>
          </div>
        </FlexRow>
        {/* 
        <FlexRow className='relative gap-5 justify-end items-center'>
          <p className='text-[#FF0000]'>Can’t find a closer office?</p>
          <Button className='bg-[#0092FF]' onClick={() => { }}>{'Confirm'}</Button>
        </FlexRow> */}

      </FlexCol>

    </main>


  )
}

export default CreateAppointment;

