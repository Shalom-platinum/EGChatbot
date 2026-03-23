import {FlexCol} from '@/app-components/FlexCol';
import {AppFormField} from '@/app-components/AppFormField';
import {UseFormReturn} from 'react-hook-form';
import {AppSelect} from '@/app-components/form/AppSelect';
import {YesNoResponse} from '@/app-model/options.data';


function CRAEligibility({form}: { form: UseFormReturn<any> }) {

    const [isCAPRResident] = form.watch(["isCAPRResident"])

    return (

        <FlexCol className='gap-7'>
            <div>
                <h2 className=' text-2xl mb-1'>CRA Eligibility</h2>
                <p className='text-[#999999]'>Kindly fill in the information below</p>
            </div>

            <section className='grid md:grid-cols-2 grid-flow-row grid-cols-1 gap-7'>
                <AppFormField form={form} name={'isBCResident'} label={'Are you a British Columbian resident?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse}/>
                <AppFormField form={form} name={'isCAPRResident'} label={'Are you a Canadian citizen / permanent resident?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse}/>
                {
                    isCAPRResident == "No" &&
                    (<>
                        <AppFormField form={form} name={'areyouarefugee'} label={'Are you a refugee?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse}/>
                        <AppFormField form={form} name={'areYouLegallyEligibleToWorkInCanada'} label={'Are you legally eligible to work in Canada?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse}/>
                        <AppFormField form={form} name={'areYouLegallyEligibleToWorkInBritishColumbia'} label={'Are you legally eligible to work in British Columbia?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse}/>
                    </>)
                }
            </section>

        </FlexCol>


    )
}

export default CRAEligibility;

