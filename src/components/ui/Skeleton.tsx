import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton component for loading states.
 * Usage: <Skeleton className="h-6 w-32" />
 */
const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700/60",
        className
      )}
      {...props}
    />
  );
};

export default Skeleton;
