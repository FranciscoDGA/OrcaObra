import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'light' | 'outline' | 'danger';
  fullWidth?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-teal-600 text-white hover:bg-teal-700',
  secondary: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  light: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
  outline: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100',
};

export default function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl px-4 py-3 font-bold min-h-[44px] transition-colors ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
