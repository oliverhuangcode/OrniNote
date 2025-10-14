// src/components/Auth/ValidatedInput.tsx
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import React from "react";

type Props = {
  name: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isValid?: boolean;
  isTouched?: boolean;
  required?: boolean;
};

export default function ValidatedInput({
  name,
  type,
  value,
  placeholder,
  onChange,
  isValid = false,
  isTouched = false,
  required = true,
}: Props) {
  const showFeedback = isTouched && value.length > 0;

  const borderColor = showFeedback
    ? isValid
      ? "border-green-500 focus:ring-green-500"
      : "border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:ring-highlight";

  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent font-inter text-sm transition-colors ${borderColor}`}
      />
      {showFeedback && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isValid ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-red-500" />
          )}
        </div>
      )}
    </div>
  );
}