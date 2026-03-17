import { FlexCol } from '@/app-components/FlexCol';
import { AppFormField } from '@/app-components/AppFormField';
import { UseFormReturn } from 'react-hook-form';
import { AppSelect } from '@/app-components/form/AppSelect';
import { YesNoResponse } from '@/app-model/options.data';

function IntentEligibility({ form }: { form: UseFormReturn<any> }) {

    return (
        <FlexCol className='gap-7'>
            <div>
                <h2 className=' text-2xl mb-1'>Client Intent Eligibility</h2>
                <p className='text-[#999999]'>Kindly fill in the information below</p>
            </div>

            <section className='grid md:grid-cols-2 grid-flow-row grid-cols-1 gap-7'>
                <AppFormField form={form} name={'unEmployedOrPE'} label={'Are you unemployed or Precariously Employed ?'} placeholder={'Select'} info={"Test Info"} Component={AppSelect} items={YesNoResponse} />
                <AppFormField form={form} name={'assistToAdvCareer'} label={'Do you require assistance to advance in your career ?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse} />
                <AppFormField form={form} name={'seekingEmployment'} label={'Are you seeking employment?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse} />
                <AppFormField form={form} name={'seekingSelfEmployment'} label={'Are you seeking self employment ?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse} />
                <AppFormField form={form} name={'requireService'} label={'Do you require our service to achieve employment or self-employment ?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse} />
            </section>
        </FlexCol>

    )
}

export default IntentEligibility;

