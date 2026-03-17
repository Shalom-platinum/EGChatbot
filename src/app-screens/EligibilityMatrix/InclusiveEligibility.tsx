import { FlexCol } from '@/app-components/FlexCol';
import { FlexRow } from '@/app-components/FlexRow';
import { AppFormField } from '@/app-components/AppFormField';
import { UseFormReturn } from 'react-hook-form';
import { Checkbox } from '@/app-components/ui/checkbox';
import { FormLabel } from '@/app-components/ui/form';
import { useCallback, useState } from 'react';
import { AppDialog, AppDialogProps } from '@/app-components/AppDialog';
import { PrivacyPolicyContent } from '@/app-components/policies/PrivacyPolicy';
import { TermsOfServiceContent } from '@/app-components/policies/TermsOfService';
import { AppSelect } from '@/app-components/form/AppSelect';
import { YesNoResponse } from '@/app-model/options.data';
import {AppCheckbox} from "@/app-components/form/AppCheckbox.tsx";

enum PolicyPresenterProps { 
    TOS,
    PRIVACY_POLICY
}

function InclusiveEligibility({ form }: { form: UseFormReturn<any> }) {
    const [open, setIsOpen] = useState<boolean>(false);
    const [presenter, setPresenter] = useState<PolicyPresenterProps>(PolicyPresenterProps.PRIVACY_POLICY);

    const modalMaps: Record<PolicyPresenterProps, Pick<AppDialogProps, 'title' | 'body'>> = {
        [PolicyPresenterProps.TOS]: {
            title: 'Terms of Service',
            body: <TermsOfServiceContent/> as any
        },
        [PolicyPresenterProps.PRIVACY_POLICY]: {
            title: 'Privacy policy',
            body: <PrivacyPolicyContent/> as any
        }
    }

    const policyPresenter = useCallback((present: PolicyPresenterProps) => {
        setIsOpen(true);
        setPresenter(present);
    }, []);

    const modalLinkClasses = 'cursor-pointer text-[#0092FF] underline';

    return (

        <FlexCol className='gap-7'>
            <div>
                <h2 className=' text-2xl mb-1'>Inclusive Group Eligibility</h2>
                <p className='text-[#999999]'>Kindly fill in the information below</p>
            </div>

            <section className='grid md:grid-cols-2 grid-flow-row grid-cols-1 gap-7'>
                <AppFormField form={form} name={'isDisabilibilty'} label={'Do you have a disability?'} placeholder={'Select'} items={YesNoResponse} Component={AppSelect} />
                <AppFormField form={form} name={'isBtw16To29'} label={'Are you between the ages 16 - 29 ?'} placeholder={'Select'} info={"Test Info"} Component={AppSelect} items={YesNoResponse} />
                <AppFormField form={form} name={'isPastAbuse'} label={'Have you been faced with any form of violence or abuse in the past?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse} />
                <AppFormField form={form} name={'isMultiplebarrier'} label={'Are you a person with multiple barriers??'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse} />
                <AppFormField form={form} name={'isEligibileForCLBC'} label={'Are you eligible for CLBC services?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse} />
                <AppFormField form={form} name={'isReferredByCLBC'} label={'Are you eligible for CLBC services?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse} />
                <AppFormField form={form} name={'isAge19'} label={'Are you above the age of 19 ?'} placeholder={'Select'} Component={AppSelect} items={YesNoResponse} />
            </section>
            <FlexRow className='gap-3 items-center content-center'>
                <AppFormField form={form} name={'checkPolicy'} Component={AppCheckbox} />
                <FormLabel htmlFor='checkPolicy'>
                    <p>
                        I acknowledge that I agree to the {''}
                        <span className={modalLinkClasses} onClick={() => policyPresenter(PolicyPresenterProps.TOS)}>Terms of Use</span>
                        {' '}and that I have read{' '}
                        <span className={modalLinkClasses} onClick={() => policyPresenter(PolicyPresenterProps.PRIVACY_POLICY)}>privacy policy</span>
                    </p>
                </FormLabel>
            </FlexRow>
            <AppDialog open={open} onOpenChange={setIsOpen} title={modalMaps[presenter].title} body={modalMaps[presenter].body} />
        </FlexCol>



    )
}

export default InclusiveEligibility;

