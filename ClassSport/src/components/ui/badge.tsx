import { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray';

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#F0FDF4] text-[#166534]',
  warning: 'bg-[#FEF3C7] text-[#92400E]',
  danger: 'bg-[#FEE2E2] text-[#991B1B]',
  info: 'bg-[#EFF6FF] text-[#1E40AF]',
  gray: 'bg-slate-100 text-slate-600',
};

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

export function Badge({ variant = 'info', children, className = '' }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold gap-1';
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
