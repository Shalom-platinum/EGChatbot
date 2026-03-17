import { useMsal } from '@azure/msal-react';
// import sparrow from 'assets/images/sparrow.png'
import { FlexCol } from '@/app-components/FlexCol';
import { AppStatCard } from '@/app-components/AppStatCard';
import { FlexRow } from '@/app-components/FlexRow';
import { AppFormField } from '@/app-components/AppFormField';
import { UseFormReturn } from 'react-hook-form';
import { AppSelect } from '@/app-components/form/AppSelect';
import { title } from 'process';
import { dummy_offices, dummy_regions, dummy_sub_regions } from '@/app-model/options.data';

function ServiceArea({form}: {form: UseFormReturn<any>}) {

    return (

        <FlexCol className='gap-7'>
            <div>
            <h2 className=' text-2xl mb-1'>Choose a Service Location</h2>
            <p className='text-[#999999]'>Kindly type your address information below to get a service area closer to you.</p>
            </div>
           
            {/* <AppFormField form={form} name={'First'} label={'Enter your address'} placeholder={'Enter your address'}/> */}
                <section className='grid md:grid-cols-2 grid-flow-row grid-cols-1 gap-7'>
                        <AppFormField form={form} name={'region'} label={'Region'} placeholder={'Region'} 
                        Component={AppSelect} 
                        items={dummy_regions}/>
                        <AppFormField form={form} name={'subRegion'} label={'Subregion'} items={dummy_sub_regions} placeholder={'Subregion'} Component={AppSelect}/>
                        <AppFormField form={form} name={'city'} label={'City'} placeholder={'City'} Component={AppSelect} items={dummy_sub_regions}/>
                        <AppFormField form={form} name={'Office'} label={'Office'} placeholder={'Office Address'} Component={AppSelect} items={dummy_offices}/>
                </section>
        </FlexCol>



    )
}

export default ServiceArea;

