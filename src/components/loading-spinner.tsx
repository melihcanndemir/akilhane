import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <BrainCircuit className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
};

export default LoadingSpinner; 