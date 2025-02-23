import { cn } from '@/lib/cn';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  maxValue?: number;
  progressColor?: string;
  backgroundColor?: string;
}

export function CircularProgress({
  value,
  size = 40,
  strokeWidth = 4,
  maxValue = 100,
  progressColor = 'bg-primary',
  backgroundColor = 'bg-gray-200'
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / maxValue) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="rotate-[-90deg]" width={size} height={size}>
        <circle
          className={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={cn(progressColor, 'transition-all duration-500 ease-out')}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
    </div>
  );
} 