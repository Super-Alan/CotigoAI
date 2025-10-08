import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ButtonProps) {
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600';
      case 'secondary':
        return 'bg-gray-200';
      case 'outline':
        return 'bg-transparent border-2 border-blue-600';
      case 'ghost':
        return 'bg-transparent';
      default:
        return 'bg-blue-600';
    }
  };

  const getSizeStyles = (): string => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2';
      case 'md':
        return 'px-6 py-3';
      case 'lg':
        return 'px-8 py-4';
      default:
        return 'px-6 py-3';
    }
  };

  const getTextStyles = (): string => {
    const baseStyles = 'font-semibold text-center';
    const colorStyles = variant === 'primary' ? 'text-white' : variant === 'outline' ? 'text-blue-600' : 'text-gray-900';
    const sizeStyles = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';
    return `${baseStyles} ${colorStyles} ${sizeStyles}`;
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`rounded-xl flex-row items-center justify-center ${getSizeStyles()} ${getVariantStyles()} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : '#3B82F6'}
          className="mr-2"
        />
      ) : (
        leftIcon && <>{leftIcon}</>
      )}

      <Text className={getTextStyles()}>{title}</Text>

      {rightIcon && !loading && <>{rightIcon}</>}
    </TouchableOpacity>
  );
}
