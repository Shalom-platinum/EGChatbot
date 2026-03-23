import {ScrollArea} from "@/app-components/ui/scroll-area";


export function PrivacyPolicyContent() {
  return (

      <ScrollArea className="h-[400px] w-full">

        <div className="py-4 overflow-y-scroll">
          <div className="space-y-5 text-sm">
            <p className={`font-bold text-base`}> Effective Date: 10-10-2024</p>
            <p>
              Welcome to Open Door Group. By accessing or using this Website, you agree to comply with and be
              bound by these Terms of Use. If you do not agree to these terms, please do not use this Website.
            </p>

            <div>
              <p className={`mb-5 font-bold`}> 1. Information We Collect</p>
              <div className={`space-y-2`}>
                <p>We may collect the following types of information:</p>
                <ul className={`list-disc space-y-3`}>
                  <li className={`pl-3`}>
                    Personal Information: When you create an account or book an appointment, we may
                    collect personal information such as your name, email address, phone number, and
                    other relevant details.
                  </li>
                  <li className={`pl-3`}>
                    Usage Data: We may collect information about your interactions with our Website,
                    including IP addresses, browser types, pages visited, and time spent on our Website.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <p className={`mb-5 font-bold`}> 2. How We Use Your Information</p>
              <div className={`space-y-2`}>
                <p>We use your information for various purposes, including:</p>
                <ul className={`list-disc space-y-3`}>
                  <li className={`pl-3`}>
                    To provide and maintain our services, including booking appointments.
                  </li>
                  <li className={`pl-3`}>
                    To communicate with you regarding your appointments, including confirmations and
                    reminders.
                  </li>
                  <li className={`pl-3`}>
                    To analyze and improve our Website and services, including enhancing the eligibility
                    matrix.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <p className={`mb-5 font-bold`}>3. Data Sharing and Disclosure</p>
              <div className={`space-y-2`}>
                <p>We do not sell or rent your personal information to third parties. We may share your
                  information in the following circumstances:</p>
                <ul className={`list-disc space-y-3`}>
                  <li className={`pl-3`}>
                    Service Providers: We may share your information with third-party service providers
                    who assist us in operating our Website and conducting our services (e.g.,
                    appointment management).
                  </li>
                  <li className={`pl-3`}>
                    Legal Compliance: We may disclose your information if required to do so by law or in
                    response to valid requests by public authorities.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <p className={`mb-5 font-bold`}>4. Data Security</p>
              <div className={`space-y-2`}>
                <p>We take the security of your personal information seriously and implement reasonable
                  security measures to protect it from unauthorized access, loss, or misuse. However, no
                  method of transmission over the Internet or electronic storage is 100% secure, and we
                  cannot guarantee its absolute security.</p>
              </div>
            </div>

            <div>
              <p className={`mb-5 font-bold`}>5. Your Rights</p>
              <div className={`space-y-2`}>
                <p>You have certain rights regarding your personal information, including:</p>
                <ul className={`list-disc space-y-3`}>
                  <li className={`pl-3`}>
                    The right to access and request a copy of the information we hold about you.
                  </li>
                  <li className={`pl-3`}>
                    The right to request correction of inaccurate or incomplete information.
                  </li>
                  <li className={`pl-3`}>
                    The right to request the deletion of your personal information, subject to certain
                    legal obligations.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <p className={`mb-5 font-bold`}>6. Cookies and Tracking Technologies</p>
              <div className={`space-y-2`}>
                <p>
                  We use cookies and similar tracking technologies to enhance your experience on our
                  Website. Cookies are small files stored on your device that help us understand how you
                  use our Website. You can manage your cookie preferences through your browser settings.
                </p>
              </div>
            </div>

            <div>
              <p className={`mb-5 font-bold`}>7. Changes to This Privacy Policy</p>
              <div className={`space-y-2`}>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes
                  by posting the new Privacy Policy on our Website. Your continued use of the Website
                  after any changes signifies your acceptance of the revised policy.
                </p>
              </div>
            </div>

            <div>
              <p className={`mb-5 font-bold`}>8. Contact Us</p>
              <div className={`space-y-2`}>
                <p>
                  If you have any questions or concerns about this Privacy Policy or our practices
                  regarding your personal information, please contact us at (555) 123-4567.
                </p>
              </div>
            </div>


          </div>

        </div>
      </ScrollArea>
  )
}
