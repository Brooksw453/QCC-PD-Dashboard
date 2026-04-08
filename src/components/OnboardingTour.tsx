'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  userId: string;
}

const steps = [
  {
    title: 'Welcome to QCC Professional Development!',
    description: 'This is your personal dashboard where you can track your learning progress, earn badges, and download certificates.',
  },
  {
    title: 'Browse Learning Items',
    description: 'Visit the Learning Items page to find courses, documents, videos, and other resources. Use search and tag filters to find what you need.',
  },
  {
    title: 'Follow Pathways',
    description: 'Pathways group learning items into structured tracks. Complete all items in a pathway to earn a badge and downloadable certificate.',
  },
  {
    title: 'Track Your Progress',
    description: 'After viewing a learning item, click "Mark as Complete" to track your progress. Your dashboard will show what you\'ve completed and what\'s next.',
  },
  {
    title: 'You\'re All Set!',
    description: 'Start exploring the learning items and pathways. Your progress is saved automatically. Good luck on your professional development journey!',
  },
];

export default function OnboardingTour({ userId }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const supabase = createClient();

  const dismiss = async () => {
    setVisible(false);
    await supabase.from('profiles').update({ has_seen_onboarding: true }).eq('id', userId);
  };

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={dismiss} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep ? 'bg-qcc-blue' : i < currentStep ? 'bg-qcc-sky' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="w-16 h-16 bg-qcc-blue-light dark:bg-qcc-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-qcc-blue dark:text-qcc-sky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {currentStep === steps.length - 1 ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </div>

        <h2 className="text-lg font-bold text-qcc-dark dark:text-white mb-2">{step.title}</h2>
        <p className="text-sm text-qcc-gray dark:text-gray-400 mb-6 leading-relaxed">{step.description}</p>

        <div className="flex items-center justify-center gap-3">
          <button onClick={dismiss}
            className="px-4 py-2 text-sm text-qcc-gray dark:text-gray-400 hover:text-qcc-dark dark:hover:text-white transition-colors">
            Skip
          </button>
          <button onClick={next}
            className="px-6 py-2 bg-qcc-blue text-white rounded-lg text-sm font-medium hover:bg-qcc-blue-hover transition-colors">
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
