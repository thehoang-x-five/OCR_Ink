import { motion } from 'framer-motion';
import type { ProgressState } from '@/types';

interface ProgressStepsProps {
  progress: ProgressState;
  status: 'idle' | 'running' | 'done' | 'error';
}

const steps = [
  { num: 1, label: 'Upload' },
  { num: 2, label: 'Preprocess' },
  { num: 3, label: 'Recognize' },
  { num: 4, label: 'Post-process' },
  { num: 5, label: 'Done' },
];

const ProgressSteps = ({ progress, status }: ProgressStepsProps) => {
  const percentage = (progress.step / progress.total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Progress Bar */}
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Steps */}
      <div className="flex justify-between">
        {steps.map((step) => {
          const isComplete = progress.step > step.num || status === 'done';
          const isCurrent = progress.step === step.num && status === 'running';
          const isError = step.num === progress.step && status === 'error';

          return (
            <div key={step.num} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                  isError
                    ? 'bg-destructive text-destructive-foreground'
                    : isComplete
                    ? 'bg-success text-success-foreground'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground animate-pulse'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isComplete && !isCurrent ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isError ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span className={`text-xs mt-1.5 ${
                isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status Text */}
      <div className="text-center">
        <p className={`text-sm font-medium ${
          status === 'error' ? 'text-destructive' : 'text-foreground'
        }`}>
          {progress.text}
        </p>
      </div>
    </motion.div>
  );
};

export default ProgressSteps;
