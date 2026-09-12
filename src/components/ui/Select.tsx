import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  help?: string;
  options: { value: string; label: string }[];
}

export default function Select({
  label,
  error,
  help,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-slate-700 mb-1.5 block">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full border border-slate-200 rounded-lg px-3 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {help && !error && (
        <p className="text-xs text-slate-500 mt-1">{help}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
