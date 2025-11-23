import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type LogoProps = HTMLAttributes<HTMLDivElement>;

export default function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={cn('font-bold tracking-tighter', className)} {...props}>
      ModelMuse
    </div>
  );
}
