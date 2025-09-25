'use client';

import React from 'react';

interface ValidationErrorDisplayProps {
  error?: string;
  className?: string;
}

/**
 * Component for displaying validation errors consistently across forms
 */
export const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({ 
  error, 
  className = "text-sm text-red-500 mt-1" 
}) => {
  if (!error) return null;
  
  return (
    <p className={className}>
      {error}
    </p>
  );
};

/**
 * Higher-order component that adds error styling to form inputs
 */
export const withErrorStyling = (Component: React.ComponentType<any>) => {
  return React.forwardRef<any, any>(({ error, className, ...props }, ref) => {
    const errorClassName = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
    const combinedClassName = `${className || ''} ${errorClassName}`.trim();
    
    return (
      <Component
        ref={ref}
        className={combinedClassName}
        {...props}
      />
    );
  });
};

/**
 * Hook for managing form validation errors
 */
export const useValidationErrors = () => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  const setError = React.useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);
  
  const clearError = React.useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);
  
  const clearAllErrors = React.useCallback(() => {
    setErrors({});
  }, []);
  
  const hasErrors = Object.keys(errors).length > 0;
  
  return {
    errors,
    setErrors,
    setError,
    clearError,
    clearAllErrors,
    hasErrors,
  };
};
