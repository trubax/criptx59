import React from 'react';

interface Step {
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex justify-between px-4 py-2 border-b theme-border bg-transparent backdrop-blur-sm">
      {steps.map((step, index) => (
        <div 
          key={step.title}
          className={`flex-1 text-center ${
            index === currentStep 
              ? 'theme-text' 
              : 'theme-text-secondary'
          }`}
        >
          <div className="mb-1">
            <span className={`w-6 h-6 text-xs inline-flex items-center justify-center rounded-full border ${
              index === currentStep ? 'border-blue-500 text-blue-500' : 'theme-border'
            }`}>
              {index + 1}
            </span>
          </div>
          <h3 className="text-xs font-medium">{step.title}</h3>
        </div>
      ))}
    </div>
  );
} 