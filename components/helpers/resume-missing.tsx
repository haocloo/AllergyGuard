import { FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MagicCard } from '@/components/magicui/magic-card';

export default function ResumeMissing() {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
      <MagicCard
        className="w-full flex flex-col items-center justify-center p-8 py-10"
        gradientSize={100}
        gradientOpacity={0.2}
        gradientColor="#D9D9D955"
      >
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl transform group-hover:scale-110 transition-transform duration-500" />
          <Image
            src="/graphics/item-missing.png"
            width={192}
            height={192}
            alt="Missing resume illustration"
            className="relative w-32 h-32 mx-auto opacity-90 drop-shadow-md"
            priority
          />
        </div>

        <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
          Resume Required
        </h3>

        <p className="text-base text-muted-foreground leading-relaxed">
          Please complete your resume before starting the mock interview. This helps us provide more
          relevant and personalized interview questions.
        </p>

        <Link
          href="/dashboard/resume/update"
          className="inline-flex items-center mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
        >
          <FileText className="w-4 h-4 mr-2" />
          Create Resume
        </Link>
      </MagicCard>
    </div>
  );
}
