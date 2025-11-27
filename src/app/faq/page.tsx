'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is bunnybox?',
    answer: 'bunnybox is a free file hosting service that allows you to upload, store, and share files up to 100MB. You can upload files anonymously or create an account for additional features like permanent storage and file management.',
  },
  {
    question: 'How large can my files be?',
    answer: 'Each file can be up to 100MB in size. Files of all sizes upload reliably thanks to our cloud storage system.',
  },
  {
    question: 'How long are files stored?',
    answer: 'By default, files are stored for 30 days. Anonymous uploads can choose deletion times ranging from 1 hour to 30 days. Registered users can set files to never expire by selecting the "Never" option when uploading.',
  },
  {
    question: 'Do I need an account to upload files?',
    answer: 'No! You can upload files anonymously without creating an account. However, creating a free account gives you access to features like permanent storage, file management dashboard, and upload history.',
  },
  {
    question: 'Why do I need an email address to upload files?',
    answer: 'If you have a registered account, you need a verified email address to upload files. This helps prevent spam and abuse of the service. Email verification ensures you\'re a real person and provides account recovery options. Anonymous users (not logged in) can upload files without an email.',
  },
  {
    question: 'How do I add an email to my account?',
    answer: 'Go to the Settings page (click your username in the top-right, then Settings). In the "Change Email" section, enter your email address and your password, then click "Update Email". You\'ll receive an 8-character verification code at that email address. Enter the code in the popup to verify and activate your account for uploads.',
  },
  {
    question: 'Is there a limit to how many files I can upload?',
    answer: 'Yes, for security reasons, we have a rate limit of 100 uploads per 24 hours. First-time violators will receive a 1-week temporary ban. Repeated violations will result in a permanent IP ban, account deletion, and removal of all associated uploads. This helps prevent abuse of the service.',
  },
  {
    question: 'What file types are supported?',
    answer: 'bunnybox supports all file types! You can upload documents, images, videos, audio files, compressed archives, and more. We provide previews for common image and text file formats.',
  },
  {
    question: 'Can I delete my uploaded files?',
    answer: 'Yes! If you uploaded a file while signed in, you can delete it at any time from your dashboard. Anonymous uploads cannot be deleted manually, but they will auto-delete based on the selected deletion time.',
  },
  {
    question: 'How do I share files?',
    answer: 'After uploading a file, you\'ll receive a unique link that you can share with anyone. Anyone with the link can view and download the file. Make sure to only share links with people you trust!',
  },
  {
    question: 'Is my data secure?',
    answer: 'We take security seriously. All files are stored securely, and we track unique visitors and downloads. However, we recommend not uploading sensitive personal information or confidential documents.',
  },
  {
    question: 'I forgot my password. How can I recover it?',
    answer: 'If you have an email address associated with your account, click "Forgot Password?" on the sign-in page and enter your username or email. We\'ll send you a password reset link that expires in 1 hour. There\'s a 30-second cooldown between reset requests, and you can request up to 5 password reset emails total. For accounts without an email address, you can use the dev key recovery method (contact @.koishi on Discord for your dev key).',
  },
  {
    question: 'Do I need to verify my email address?',
    answer: 'Yes! When you create an account with an email address, you must verify it before uploading files. We\'ll send you an 8-character verification code to your email. Enter it in the activation popup to verify your account. You can request a new code if needed, but please note there\'s a 30-second cooldown between requests and a maximum of 5 verification emails per account.',
  },
  {
    question: 'I\'m not receiving verification emails. What should I do?',
    answer: 'First, check your spam/junk folder. Verification emails come from noreply@bunnybox.moe. If you still don\'t see it, you can request a new code from the activation popup. Please note: there\'s a 30-second cooldown between email requests, and you can request up to 5 verification emails total. If you\'ve reached the limit, contact support@bunnybox.moe or @.koishi on Discord for assistance.',
  },
  {
    question: 'Can I sign in with my email address?',
    answer: 'Yes! You can sign in using either your username or your email address, along with your password. This makes it easier to access your account if you forget your username.',
  },
  {
    question: 'Can I use bunnybox for commercial purposes?',
    answer: 'bunnybox is primarily designed for personal use. For commercial use cases, please review our Terms of Service and Acceptable Use Policy on the Legal page.',
  },
  {
    question: 'What happens if my file expires?',
    answer: 'Once a file reaches its expiration date, it will be automatically deleted from our servers and the link will no longer work. Make sure to download any important files before they expire!',
  },
  {
    question: 'What happens to inactive accounts?',
    answer: 'Accounts that have been inactive for 6 months (no uploads or sign-ins) will be automatically deleted along with all associated files. This helps us maintain server resources and keep the service running smoothly for active users.',
  },
  {
    question: 'How can I support bunnybox and help with upkeep costs?',
    answer: 'If you enjoy using bunnybox and want to help keep the service running, you can support the developer through Ko-fi! Click the "Donate" tab at the top of the page, or visit ko-fi.com/koishiwastaken. Your support helps cover hosting costs, storage, and keeps bunnybox free for everyone. Every donation is greatly appreciated!',
  },
];

function FAQAccordion({ faq }: { faq: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bunny-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/30 dark:hover:bg-black/20 transition-all"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 pr-4">
          {faq.question}
        </h3>
        <svg
          className={`w-5 h-5 text-pink-600 dark:text-pink-400 transition-transform flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-2">
          <p className="text-black dark:text-white leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bunny-gradient">
      <Navigation />

      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-black dark:text-white">
            Find answers to common questions about bunnybox
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQAccordion key={index} faq={faq} />
          ))}
        </div>

        <Card className="bunny-card p-6 mt-8 text-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Still have questions?
          </h3>
          <p className="text-black dark:text-white mb-2">
            Email us at{' '}
            <a href="mailto:support@bunnybox.moe" className="text-pink-600 dark:text-pink-400 hover:underline font-semibold">
              support@bunnybox.moe
            </a>
          </p>
          <p className="text-black dark:text-white text-sm">
            Or contact @.koishi on Discord
          </p>
        </Card>

        <Footer />
      </div>
    </div>
  );
}
