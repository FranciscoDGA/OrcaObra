import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  help?: string;
}

export default function Textarea({
  label,
  error,
  help,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-semibold text-slate-700 mb-1.5 block">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full border border-slate-200 rounded-lg px-3 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-vertical min-h-[100px] ${error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
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
