import { AnimatedList } from '@/components/magicui/animated-list';
import { cn } from '@/lib/cn';

type LoadingStep = {
  name: string;
  description: string;
  icon: string;
  color: string;
};

export const loadingSteps = [
  {
    name: 'Analyzing Symptoms',
    description: 'Processing your symptom descriptions...',
    icon: '🔍',
    color: '#00C9A7',
  },
  {
    name: 'Database Search',
    description: 'Searching medical knowledge base...',
    icon: '📚',
    color: '#FFB800',
  },
  {
    name: 'Smart Analysis',
    description: 'Identifying potential diagnoses...',
    icon: '🧠',
    color: '#FF3D71',
  },
  {
    name: 'Action Planning',
    description: 'Preparing recommended actions...',
    icon: '⚡',
    color: '#9C27B0',
  },
];

const LoadingStep = ({ name, description, icon, color }: LoadingStep & { className?: string }) => {
  return (
    <figure
      className={cn(
        'relative mx-auto min-h-fit w-full cursor-pointer overflow-hidden rounded-2xl p-4',
        'transition-all duration-200 ease-in-out hover:scale-[103%]',
        'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
        'transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]'
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{ backgroundColor: color }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white">
            <span className="text-sm sm:text-lg">{name}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">{description}</p>
        </div>
      </div>
    </figure>
  );
};

export const LoadingSteps = () => {
  return (
    <AnimatedList className="w-full">
      {loadingSteps.map((step, idx) => (
        <LoadingStep key={idx} {...step} />
      ))}
    </AnimatedList>
  );
};
