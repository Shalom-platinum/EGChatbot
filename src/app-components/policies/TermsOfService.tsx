import {ScrollArea} from "@/app-components/ui/scroll-area";


export function TermsOfServiceContent() {
  return (

      <ScrollArea className="h-[400px] w-full">

        <div className="py-4 overflow-y-scroll">
          <div className="">
            <p className={`font-bold`}> Effective Date: 10-10-2024</p>
            <p>
              Welcome to Open Door Group. By accessing or using this Website, you agree to comply with and be
              bound by these Terms of Use. If you do not agree to these terms, please do not use this Website.
            </p>


            <div>
              <p className={`mb-5 font-bold`}>1. Acceptance of Terms</p>
              <div className={`space-y-2`}>
                <p> By using the Website, you affirm that you are at least 18 years old or are using the
                  Website under
                  the supervision of a parent or guardian. You agree to provide accurate information when
                  creating an
                  account or booking an appointment.
                </p>
                <ul className={`list-disc space-y-2`}>
                  <li className={`pl-3`}></li>
                  <li className={`pl-3`}></li>
                </ul>
              </div>
            </div>

            <div>
              <p className={`mb-5 font-bold`}>2. Eligibility Matrix</p>
              <div className={`space-y-2`}>
                <p>Our eligibility matrix is designed to help users determine their qualifications for
                  specific
                  services offered on the Website. The matrix is based on criteria established by Open
                  Door Group.
                  for accuracy, we do not guarantee that the information is complete or up to date.
                </p>
                <ul className={`list-disc space-y-2`}>
                  <li className={`pl-3`}>
                    Accuracy: The eligibility information provided is for informational purposes only.
                    While
                    we strive
                  </li>
                  <li className={`pl-3`}>
                    No Guarantee: Meeting the criteria outlined in the eligibility matrix does not
                    guarantee
                    service
                    availability or an appointment.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <p className={`mb-5 font-bold`}>
                3. Client Data Information
              </p>
              <div className={`space-y-2`}>
                <p>
                  When you book an appointment or create an account, you may be required to provide
                  personal
                  information. Your data will be collected, stored, and processed in accordance with our
                  Privacy
                  Policy.
                  you regarding your bookings.
                </p>
                <ul className={`list-disc space-y-2`}>
                  <li className={`pl-3`}>
                    Data Use: We may use your data to confirm appointments, improve our services, and
                    communicate with

                  </li>
                  <li className={`pl-3`}>
                    Data Security: We implement reasonable security measures to protect your personal
                    information.
                    However, no method of transmission over the Internet or electronic storage is
                    completely
                    secure, and
                    we cannot guarantee its absolute security.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <p className={`mb-5 font-bold`}>
                4. User Responsibilities
              </p>
              <div className={`space-y-2`}>

                <ul className={`list-disc space-y-2`}>
                  <li className={`pl-3`}>
                    Account Security: You are responsible for maintaining the confidentiality of your
                    account
                    information, including your password. You agree to notify us immediately of any
                    unauthorized use of
                    your account.
                  </li>
                  <li className={`pl-3`}>
                    Prohibited Activities: You agree not to engage in any unlawful or harmful activity
                    while using the
                    Website, including but not limited to:
                    <li className={`pl-3`}>
                      Impersonating any person or entity.
                    </li>
                    <li className={`pl-3`}>
                      Attempting to gain unauthorized access to any portion of the Website.
                    </li>
                    <li className={`pl-3`}>
                      Using the Website for any fraudulent or malicious purpose.
                    </li>
                  </li>

                </ul>
              </div>
            </div>


            <div>
              <p className={`mb-5 font-bold`}>
                5. Limitation of Liability
              </p>
              <div className={`space-y-2`}>
                <p>
                  To the fullest extent permitted by law, Open Door Group shall not be liable for any
                  direct,
                  indirect, incidental, special, consequential, or punitive damages arising from your use
                  of the
                  Website or services, including but not limited to loss of profits, data, or other
                  intangible losses.
                </p>

              </div>
            </div>

            <div>
              <p className={`mb-5 font-bold`}>
                6. Modifications to Terms
              </p>
              <div className={`space-y-2`}>
                <p>
                  We may update these Terms of Use from time to time. We will notify you of any changes by
                  posting the
                  new Terms on the Website. Your continued use of the Website after any such changes
                  constitutes your
                  acceptance of the new Terms.
                </p>
              </div>
            </div>

            <div>
              <p className={`mb-5 font-bold`}>
                7. Governing Law
              </p>
              <div className={`space-y-2`}>
                <p>
                  These Terms of Use shall be governed by and construed in accordance with the laws of BC,
                  Canada,
                  without regard to its conflict of law principles.
                </p>
              </div>
            </div>


            <div>
              <p className={`mb-5 font-bold`}>
                8. Contact Us
              </p>
              <div className={`space-y-2`}>
                <p>
                  If you have any questions or concerns about these Terms of Use, please contact us at
                  (555) 123-4567.
                </p>
              </div>
            </div>


          </div>
        </div>
      </ScrollArea>
  )
}
