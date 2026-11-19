'use client';

import React, { useId } from 'react';
import { useLanguage } from '@/i18n/provider';

export interface InputProps {
  label?: string;
  labelbn?: string;
  type?: string;
  name?: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  placeholderbn?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  textarea?: boolean;
  rows?: number;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  autoComplete?: string;
}

/**
 * Accessible form input & textarea component with bilingual English/Bengali
 * label & placeholder support, and styled focus states.
 */
export const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(
  (
    {
      label,
      labelbn,
      type = 'text',
      name,
      id: customId,
      required = false,
      placeholder,
      placeholderbn,
      value,
      defaultValue,
      onChange,
      onBlur,
      textarea = false,
      rows = 4,
      className = '',
      inputClassName = '',
      disabled = false,
      error,
      helperText,
      autoComplete,
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || (name ? `input-${name}` : generatedId);
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const { locale } = useLanguage();
    const isBengali = locale === 'bn';

    const displayLabel = isBengali && labelbn ? labelbn : label;
    const displayPlaceholder = isBengali && placeholderbn ? placeholderbn : placeholder;

    const baseInputStyles = [
      'w-full rounded-xl border bg-white dark:bg-dark-surface px-4 py-3',
      'text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500',
      'transition-all duration-200 outline-none',
      error
        ? 'border-red-500 focus:ring-2 focus:ring-red-400 focus:border-red-500'
        : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-leaf focus:border-leaf',
      disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : '',
      isBengali ? 'font-bengali' : 'font-sans',
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ');

    const describedBy = [
      error ? errorId : null,
      helperText ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className={`w-full flex flex-col gap-1.5 ${className}`}>
        {displayLabel && (
          <label
            htmlFor={inputId}
            className={`text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between ${
              isBengali ? 'font-bengali' : 'font-sans'
            }`}
          >
            <span>
              {displayLabel}
              {required && (
                <span className="text-red-500 ml-1" aria-hidden="true">
                  *
                </span>
              )}
            </span>
          </label>
        )}

        {textarea ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={inputId}
            name={name}
            rows={rows}
            required={required}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={displayPlaceholder}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`${baseInputStyles} resize-y min-h-[100px]`}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            id={inputId}
            name={name}
            required={required}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={displayPlaceholder}
            autoComplete={autoComplete}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={baseInputStyles}
          />
        )}

        {/* Error message */}
        {error && (
          <p id={errorId} className="text-xs text-red-500 font-medium mt-0.5">
            {error}
          </p>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <p id={helperId} className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
