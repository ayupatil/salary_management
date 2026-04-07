import React from 'react';

const Dropdown = React.forwardRef(
  (
    {
      id,
      label,
      value,
      onChange,
      options = [],
      placeholder,
      required = false,
      className = '',
      error,
      onClear,
      showClearButton = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 border ${
              error ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              showClearButton ? 'pr-10' : ''
            }`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {showClearButton && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear selection"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

export { Dropdown };
