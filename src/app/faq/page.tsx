'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

interface FAQItem {
  question: string;
  answer: string;
}

function FAQAccordion({ faq }: { faq: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bunny-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-white/30 dark:hover:bg-black/20 transition-all min-h-[44px]"
      >
        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 pr-2 sm:pr-4">
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
        <div className="px-4 sm:px-6 pb-3 sm:pb-4 pt-2">
          <p className="text-sm sm:text-base text-black dark:text-white leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const { t } = useLanguage();

  // Build FAQs array from translations
  const faqs: FAQItem[] = [
    { question: t.faq.q1, answer: t.faq.a1 },
    { question: t.faq.q2, answer: t.faq.a2 },
    { question: t.faq.q3, answer: t.faq.a3 },
    { question: t.faq.q4, answer: t.faq.a4 },
    { question: t.faq.q5, answer: t.faq.a5 },
    { question: t.faq.q6, answer: t.faq.a6 },
    { question: t.faq.q7, answer: t.faq.a7 },
    { question: t.faq.q8, answer: t.faq.a8 },
    { question: t.faq.q9, answer: t.faq.a9 },
    { question: t.faq.q10, answer: t.faq.a10 },
    { question: t.faq.q11, answer: t.faq.a11 },
    { question: t.faq.q12, answer: t.faq.a12 },
    { question: t.faq.q13, answer: t.faq.a13 },
    { question: t.faq.q14, answer: t.faq.a14 },
    { question: t.faq.q15, answer: t.faq.a15 },
    { question: t.faq.q16, answer: t.faq.a16 },
    { question: t.faq.q17, answer: t.faq.a17 },
    { question: t.faq.q18, answer: t.faq.a18 },
    { question: t.faq.q19, answer: t.faq.a19 },
    { question: t.faq.q20, answer: t.faq.a20 },
  ];

  return (
    <div className="min-h-screen bunny-gradient">
      <Navigation />

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            {t.faq.title}
          </h1>
          <p className="text-base sm:text-lg text-black dark:text-white">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <FAQAccordion key={index} faq={faq} />
          ))}
        </div>

        <Card className="bunny-card p-4 sm:p-6 mt-6 sm:mt-8 text-center">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {t.faq.contactTitle}
          </h3>
          <p className="text-black dark:text-white mb-2">
            {t.faq.contactText}{' '}
            <a href="mailto:support@bunnybox.moe" className="text-pink-600 dark:text-pink-400 hover:underline font-semibold">
              {t.legal.contactEmail}
            </a>
          </p>
          <p className="text-black dark:text-white text-sm">
            {t.faq.contactDiscord}
          </p>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
