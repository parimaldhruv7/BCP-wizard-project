import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex items-center">
              {/* Step Circle */}
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
                
                {/* Step Label */}
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step}
                  </p>
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-4 transition-colors ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Mobile Step Labels */}
      <div className="sm:hidden mt-4 text-center">
        <p className="text-sm font-medium text-blue-600">
          Step {currentStep}: {steps[currentStep - 1]}
        </p>
      </div>
    </div>
  );
};

export default StepIndicator;