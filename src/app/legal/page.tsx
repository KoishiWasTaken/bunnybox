'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

type LegalTab = 'tos' | 'privacy' | 'aup' | 'dmca';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<LegalTab>('tos');
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bunny-gradient">
      <Navigation />

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            {t.legal.title}
          </h1>
          <p className="text-base sm:text-lg text-black dark:text-white">
            {t.legal.subtitle}
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex gap-2 sm:gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('tos')}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
              activeTab === 'tos'
                ? 'bg-pink-300 dark:bg-pink-900/50 text-pink-900 dark:text-pink-200'
                : 'bg-white/50 dark:bg-black/20 text-black dark:text-white hover:bg-pink-100 dark:hover:bg-pink-950/30'
            }`}
          >
            {t.legal.termsOfService}
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
              activeTab === 'privacy'
                ? 'bg-pink-300 dark:bg-pink-900/50 text-pink-900 dark:text-pink-200'
                : 'bg-white/50 dark:bg-black/20 text-black dark:text-white hover:bg-pink-100 dark:hover:bg-pink-950/30'
            }`}
          >
            {t.legal.privacyPolicy}
          </button>
          <button
            onClick={() => setActiveTab('aup')}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
              activeTab === 'aup'
                ? 'bg-pink-300 dark:bg-pink-900/50 text-pink-900 dark:text-pink-200'
                : 'bg-white/50 dark:bg-black/20 text-black dark:text-white hover:bg-pink-100 dark:hover:bg-pink-950/30'
            }`}
          >
            {t.legal.acceptableUsePolicy}
          </button>
          <button
            onClick={() => setActiveTab('dmca')}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
              activeTab === 'dmca'
                ? 'bg-pink-300 dark:bg-pink-900/50 text-pink-900 dark:text-pink-200'
                : 'bg-white/50 dark:bg-black/20 text-black dark:text-white hover:bg-pink-100 dark:hover:bg-pink-950/30'
            }`}
          >
            {t.legal.dmcaPolicy}
          </button>
        </div>

        <Card className="bunny-card p-4 sm:p-6 lg:p-8">
          {activeTab === 'tos' && <TermsOfService />}
          {activeTab === 'privacy' && <PrivacyPolicy />}
          {activeTab === 'aup' && <AcceptableUsePolicy />}
          {activeTab === 'dmca' && <DMCAPolicy />}
        </Card>

        <Footer />
      </div>
    </div>
  );
}

function TermsOfService() {
  const { t } = useLanguage();
  return (
    <div className="prose prose-pink dark:prose-invert max-w-none">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t.legal.termsOfService}</h2>
      <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 mb-6">{t.legal.lastUpdated}: November 25, 2025</p>

      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">1. Acceptance of Terms</h3>
      <p className="text-black dark:text-white mb-4">
        By accessing and using bunnybox ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">2. Description of Service</h3>
      <p className="text-black dark:text-white mb-4">
        bunnybox provides file hosting and sharing services. Users may upload, store, and share files up to 100MB in size. The Service is provided "as is" without any warranties, express or implied.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">3. User Accounts</h3>
      <p className="text-black dark:text-white mb-4">
        Users may create accounts to access additional features. You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.
      </p>
      <p className="text-black dark:text-white mb-4">
        <strong>Email Verification:</strong> Accounts created with an email address must be verified before uploading files. We will send a verification code to your email that must be entered to activate your account. You can request a new verification code at any time.
      </p>
      <p className="text-black dark:text-white mb-4">
        <strong>Password Reset:</strong> If you have an email associated with your account, you can reset your password by requesting a one-time reset link. This link expires in 1 hour and can only be used once. Accounts without email addresses can use the dev key recovery method (contact <a href="mailto:support@bunnybox.moe" className="text-pink-600 dark:text-pink-400 hover:underline">support@bunnybox.moe</a> or @.koishi on Discord).
      </p>
      <p className="text-black dark:text-white mb-4">
        <strong>Sign In Options:</strong> You may sign in using either your username or your email address along with your password.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">4. File Storage and Deletion</h3>
      <p className="text-black dark:text-white mb-4">
        Files uploaded to bunnybox may be automatically deleted based on the deletion period selected at upload time. We reserve the right to delete files at any time for any reason, including but not limited to violations of these terms or resource limitations.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">5. Account Inactivity</h3>
      <p className="text-black dark:text-white mb-4">
        Accounts that remain inactive for 6 months (no uploads or sign-ins) will be automatically deleted along with all associated files. This policy helps us maintain server resources and ensure service quality for active users. You will not receive a notification before deletion, so please ensure you sign in periodically if you wish to keep your account active.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">6. Rate Limiting and Enforcement</h3>
      <p className="text-black dark:text-white mb-4">
        To prevent abuse, we impose rate limits on file uploads. Currently, users are limited to 100 uploads per 24 hours. First-time violators will receive a 1-week temporary ban. Repeated violations will result in a permanent IP ban, account deletion, and removal of all associated uploads. We reserve the right to modify these limits and enforcement policies as needed to maintain service quality.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">7. Intellectual Property</h3>
      <p className="text-black dark:text-white mb-4">
        You retain all rights to content you upload to bunnybox. By uploading content, you grant us a non-exclusive, worldwide license to store, process, and display your content as necessary to provide the Service.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">8. Limitation of Liability</h3>
      <p className="text-black dark:text-white mb-4">
        bunnybox and its operators shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service, including but not limited to loss of data or files.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">9. Modifications to Service</h3>
      <p className="text-black dark:text-white mb-4">
        We reserve the right to modify or discontinue the Service at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">10. Governing Law</h3>
      <p className="text-black dark:text-white mb-4">
        These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">10. Contact</h3>
      <p className="text-black dark:text-white">
        For questions about these Terms of Service, please email <a href="mailto:support@bunnybox.moe" className="text-pink-600 dark:text-pink-400 hover:underline">support@bunnybox.moe</a> or contact @.koishi on Discord.
      </p>
    </div>
  );
}

function PrivacyPolicy() {
  const { t } = useLanguage();
  return (
    <div className="prose prose-pink dark:prose-invert max-w-none">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t.legal.privacyPolicy}</h2>
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-6">{t.legal.lastUpdated}: November 25, 2025</p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">1. Information We Collect</h3>
      <p className="text-black dark:text-white mb-4">
        We collect information that you provide directly to us, including:
      </p>
      <ul className="list-disc list-inside text-black dark:text-white mb-4 space-y-2">
        <li>Username and password when you create an account</li>
        <li>Email address (optional but required for password reset and account verification)</li>
        <li>Files and associated metadata that you upload</li>
        <li>IP addresses for rate limiting, security, and analytics purposes</li>
        <li>Browser and device information through standard web logs</li>
        <li>Account verification status and one-time reset tokens (securely hashed)</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">2. How We Use Your Information</h3>
      <p className="text-black dark:text-white mb-4">
        We use the information we collect to:
      </p>
      <ul className="list-disc list-inside text-black dark:text-white mb-4 space-y-2">
        <li>Provide, maintain, and improve our services</li>
        <li>Process and store your uploaded files</li>
        <li>Send account verification codes and password reset links via email</li>
        <li>Send important account notifications (password changes, email updates)</li>
        <li>Enforce our rate limiting and security policies</li>
        <li>Track file statistics (views, downloads, unique visitors)</li>
        <li>Communicate with you about the Service</li>
      </ul>
      <p className="text-black dark:text-white mb-4">
        <strong>Email Communications:</strong> We will only send you transactional emails related to account security (verification codes, password resets, and security notifications). We do not send marketing emails or share your email with third parties.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">3. Information Sharing</h3>
      <p className="text-black dark:text-white mb-4">
        We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:
      </p>
      <ul className="list-disc list-inside text-black dark:text-white mb-4 space-y-2">
        <li>When required by law or to respond to legal processes</li>
        <li>To protect the rights, property, or safety of bunnybox, our users, or others</li>
        <li>With service providers who assist in operating our platform</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">4. Data Storage and Security</h3>
      <p className="text-black dark:text-white mb-4">
        We implement reasonable security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure. Files are stored on secure servers and are subject to automatic deletion based on user-selected retention periods.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">5. Cookies and Tracking</h3>
      <p className="text-black dark:text-white mb-4">
        We use browser localStorage to maintain user sessions and preferences, including theme settings. We track unique visitors to files using IP addresses for analytics purposes.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">6. Your Rights</h3>
      <p className="text-black dark:text-white mb-4">
        You have the right to:
      </p>
      <ul className="list-disc list-inside text-black dark:text-white mb-4 space-y-2">
        <li>Access and update your account information</li>
        <li>Delete files you have uploaded (if logged in)</li>
        <li>Request deletion of your account and associated data</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">7. Children's Privacy</h3>
      <p className="text-black dark:text-white mb-4">
        Our Service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">8. Changes to Privacy Policy</h3>
      <p className="text-black dark:text-white mb-4">
        We may update this Privacy Policy from time to time. We will notify users of any material changes by posting the new Privacy Policy on this page.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">9. Contact</h3>
      <p className="text-black dark:text-white">
        For questions about this Privacy Policy, please email <a href="mailto:support@bunnybox.moe" className="text-pink-600 dark:text-pink-400 hover:underline">support@bunnybox.moe</a> or contact @.koishi on Discord.
      </p>
    </div>
  );
}

function AcceptableUsePolicy() {
  const { t } = useLanguage();
  return (
    <div className="prose prose-pink dark:prose-invert max-w-none">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t.legal.acceptableUsePolicy}</h2>
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-6">{t.legal.lastUpdated}: November 25, 2025</p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">1. Purpose</h3>
      <p className="text-black dark:text-white mb-4">
        This Acceptable Use Policy outlines prohibited uses of bunnybox. This policy is designed to protect our users, the Service, and the broader Internet community.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">2. Prohibited Activities</h3>
      <p className="text-black dark:text-white mb-4">
        You may not use bunnybox to:
      </p>
      <ul className="list-disc list-inside text-black dark:text-white mb-4 space-y-2">
        <li>Violate any applicable laws or regulations</li>
        <li>Infringe upon intellectual property rights of others</li>
        <li>Distribute malware, viruses, or other malicious software</li>
        <li>Engage in phishing, fraud, or other deceptive practices</li>
        <li>Harass, threaten, or harm others</li>
        <li>Distribute spam or unsolicited commercial content</li>
        <li>Attempt to gain unauthorized access to other systems or networks</li>
        <li>Interfere with or disrupt the Service or servers</li>
        <li>Use automated tools to abuse rate limits or system resources</li>
        <li>Upload files that violate the privacy rights of others</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">3. File Content Restrictions</h3>
      <p className="text-black dark:text-white mb-4">
        Users are responsible for ensuring that their uploaded content complies with all applicable laws. We reserve the right to remove any content that violates this policy or applicable law.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">4. Enforcement</h3>
      <p className="text-black dark:text-white mb-4">
        Violations of this Acceptable Use Policy may result in:
      </p>
      <ul className="list-disc list-inside text-black dark:text-white mb-4 space-y-2">
        <li>Removal of offending content</li>
        <li>Temporary or permanent suspension of your account</li>
        <li>Temporary or permanent ban from the Service</li>
        <li>Legal action if required</li>
        <li>Reporting to appropriate law enforcement authorities</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">5. Reporting Violations</h3>
      <p className="text-black dark:text-white mb-4">
        If you become aware of any violation of this Acceptable Use Policy, please email <a href="mailto:support@bunnybox.moe" className="text-pink-600 dark:text-pink-400 hover:underline">support@bunnybox.moe</a> or contact @.koishi on Discord immediately with details of the violation.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">6. Bandwidth and Resource Usage</h3>
      <p className="text-black dark:text-white mb-4">
        Users must not abuse the Service by using excessive bandwidth or system resources. We reserve the right to implement additional rate limiting or restrictions as necessary to maintain service quality for all users.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">7. Third-Party Services</h3>
      <p className="text-black dark:text-white mb-4">
        You may not use bunnybox as a CDN or backend storage for external applications without prior written permission. The Service is intended for direct file sharing purposes only.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">8. Cooperation with Authorities</h3>
      <p className="text-black dark:text-white mb-4">
        We cooperate with law enforcement agencies and may disclose user information when legally required or when we believe disclosure is necessary to protect our rights or the rights of others.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">9. Updates to Policy</h3>
      <p className="text-black dark:text-white mb-4">
        We reserve the right to update this Acceptable Use Policy at any time. Continued use of the Service after changes constitutes acceptance of the updated policy.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">10. Contact</h3>
      <p className="text-black dark:text-white">
        For questions about this Acceptable Use Policy, please email <a href="mailto:support@bunnybox.moe" className="text-pink-600 dark:text-pink-400 hover:underline">support@bunnybox.moe</a> or contact @.koishi on Discord.
      </p>
    </div>
  );
}

function DMCAPolicy() {
  const { t } = useLanguage();
  return (
    <div className="prose prose-pink dark:prose-invert max-w-none">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">DMCA and Intellectual Property Policy</h2>
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-6">{t.legal.lastUpdated}: November 25, 2025</p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">1. Overview</h3>
      <p className="text-black dark:text-white mb-4">
        bunnybox respects the intellectual property rights of others and expects users to do the same. We will respond to valid notices of copyright infringement in accordance with the Digital Millennium Copyright Act ("DMCA") and other applicable intellectual property laws.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">2. Copyright Infringement Notification</h3>
      <p className="text-black dark:text-white mb-4">
        If you believe that content hosted on bunnybox infringes your copyright, please provide a notice containing the following information:
      </p>
      <ul className="list-disc list-inside text-black dark:text-white mb-4 space-y-2">
        <li>A physical or electronic signature of the copyright owner or authorized representative</li>
        <li>Identification of the copyrighted work claimed to have been infringed</li>
        <li>Identification of the material that is claimed to be infringing, including the file URL</li>
        <li>Your contact information (address, telephone number, email address)</li>
        <li>A statement that you have a good faith belief that use of the material is not authorized</li>
        <li>A statement that the information in the notification is accurate and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">3. How to Submit a DMCA Notice</h3>
      <p className="text-black dark:text-white mb-4">
        DMCA notices should be sent to koishiwastaken@gmail.com. Please include "DMCA Notice" in your message subject line.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">4. Counter-Notification</h3>
      <p className="text-black dark:text-white mb-4">
        If you believe that content you uploaded was wrongly removed due to a DMCA notice, you may submit a counter-notification containing:
      </p>
      <ul className="list-disc list-inside text-black dark:text-white mb-4 space-y-2">
        <li>Your physical or electronic signature</li>
        <li>Identification of the material that was removed and its location before removal</li>
        <li>A statement under penalty of perjury that you have a good faith belief the material was removed due to mistake or misidentification</li>
        <li>Your name, address, and telephone number</li>
        <li>A statement consenting to jurisdiction in your location</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">5. Repeat Infringer Policy</h3>
      <p className="text-black dark:text-white mb-4">
        Users who repeatedly infringe copyrights or other intellectual property rights will have their accounts terminated and may be permanently banned from the Service.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">6. Trademark Rights</h3>
      <p className="text-black dark:text-white mb-4">
        bunnybox also respects trademark rights. If you believe content on our Service infringes your trademark, please email <a href="mailto:support@bunnybox.moe" className="text-pink-600 dark:text-pink-400 hover:underline">support@bunnybox.moe</a> with details including proof of trademark ownership and the specific infringing material.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">7. Other Intellectual Property</h3>
      <p className="text-black dark:text-white mb-4">
        This policy extends to other forms of intellectual property including but not limited to patents, trade secrets, and rights of publicity. If you believe your intellectual property rights have been violated, please email <a href="mailto:support@bunnybox.moe" className="text-pink-600 dark:text-pink-400 hover:underline">support@bunnybox.moe</a>.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">8. Processing Time</h3>
      <p className="text-black dark:text-white mb-4">
        We aim to process valid DMCA notices and counter-notifications promptly. Please allow up to 7 business days for a response. Emergency requests will be prioritized.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">9. False Claims</h3>
      <p className="text-black dark:text-white mb-4">
        Please note that under Section 512(f) of the DMCA, anyone who knowingly materially misrepresents that material is infringing may be subject to liability. False claims may result in legal consequences.
      </p>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">10. Contact</h3>
      <p className="text-black dark:text-white">
        For DMCA notices or intellectual property concerns, please email <a href="mailto:support@bunnybox.moe" className="text-pink-600 dark:text-pink-400 hover:underline">support@bunnybox.moe</a> or contact @.koishi on Discord.
      </p>
    </div>
  );
}
