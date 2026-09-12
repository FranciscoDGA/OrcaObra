import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
}

export default function Input({
  label,
  error,
  help,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 mb-1.5 block">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full border border-slate-200 rounded-lg px-3 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {help && !error && (
        <p className="text-xs text-slate-500 mt-1">{help}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
