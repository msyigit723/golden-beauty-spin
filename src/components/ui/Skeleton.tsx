import { cn } from '@/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: number | string;
  rounded?: string;
}

function Skeleton({
  className,
  height,
  rounded,
  ...props
}: SkeletonProps) {
  return (
    <div
      style={{ height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined }}
      className={cn('animate-pulse bg-gray-200', rounded || 'rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };
