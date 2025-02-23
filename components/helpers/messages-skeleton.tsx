import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "../ui/card";

export default function MessagesSkeleton() {
  const FeedbackColor = "bg-green-50/50 dark:bg-green-900/50";
  const AnswerColor = "bg-yellow-50/50 dark:bg-yellow-900/50";
  const UserColor = "bg-blue-50/50 dark:bg-blue-900/50";

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full relative">
        <CardContent className="flex-1 overflow-y-auto p-4 pb-32 scroll-smooth">
          {/* User Message Skeleton */}
          <div className={" p-4 rounded-lg shadow-md"}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Skeleton className={UserColor + " w-5 h-5 rounded-full"} /> {/* User icon */}
                <Skeleton className={UserColor + " w-24 h-5"} /> {/* "Your Answer" text */}
              </div>
              <div className="flex items-center space-x-1">
                <Skeleton className={UserColor + " w-4 h-4"} /> {/* Clock icon */}
                <Skeleton className={UserColor + " w-20 h-4"} /> {/* Timestamp */}
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className={UserColor + " w-full h-4"} />
              <Skeleton className={UserColor + " w-4/5 h-4"} />
            </div>
          </div>

          <div className={" p-4 rounded-lg shadow-md"}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Skeleton className={FeedbackColor + " w-5 h-5 rounded-full"} /> {/* Bot icon */}
                <Skeleton className={FeedbackColor + " w-24 h-5"} /> {/* "AI Feedback" text */}
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className={FeedbackColor + " w-full h-4"} />
              <Skeleton className={FeedbackColor + " w-4/5 h-4"} />
            </div>
          </div>

          <div className={" p-4 rounded-lg shadow-md"}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Skeleton className={AnswerColor + " w-5 h-5 rounded-full"} /> {/* Sparkle icon */}
                <Skeleton className={AnswerColor + " w-24 h-5"} /> {/* "Sample Answer" text */}
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className={AnswerColor + " w-full h-4"} />
              <Skeleton className={AnswerColor + " w-4/5 h-4"} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
