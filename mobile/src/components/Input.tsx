import React from 'react';
import {
  TextInput,
  View,
  Text,
  TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  containerClassName = '',
  className = '',
  ...props
}: InputProps) {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Text>
      )}

      <View className="flex-row items-center">
        {leftIcon && (
          <View className="absolute left-3 z-10">{leftIcon}</View>
        )}

        <TextInput
          className={`flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
          placeholderTextColor="#9CA3AF"
          {...props}
        />

        {rightIcon && (
          <View className="absolute right-3">{rightIcon}</View>
        )}
      </View>

      {error && (
        <Text className="text-sm text-red-500 mt-1">{error}</Text>
      )}
    </View>
  );
}
