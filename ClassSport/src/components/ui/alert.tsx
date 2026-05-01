import { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function Alert({ children, className = '', variant = 'default' }: AlertProps) {
  const variantStyles = {
    default: 'bg-slate-50 border-slate-200',
    success: 'bg-[#F0FDF4] border-[#16A34A]',
    warning: 'bg-[#FEF3C7] border-[#F59E0B]',
    error: 'bg-[#FEE2E2] border-[#DC2626]',
  };

  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface AlertTitleProps {
  children: ReactNode;
  className?: string;
}

export function AlertTitle({ children, className = '' }: AlertTitleProps) {
  return (
    <h3 className={`mb-1 font-medium ${className}`}>
      {children}
    </h3>
  );
}

interface AlertDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function AlertDescription({ children, className = '' }: AlertDescriptionProps) {
  return (
    <p className={`text-sm ${className}`}>
      {children}
    </p>
  );
}
