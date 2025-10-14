// src/components/Auth/PasswordStrength.tsx
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

type PasswordRule = {
  label: string;
  test: (p: string) => boolean;
};

type Props = {
  password?: string;
  rules: PasswordRule[];
};

export default function PasswordStrength({ password = "", rules }: Props) {
  const validCount = rules.filter((r) => r.test(password)).length;
  const strength = validCount / rules.length;
  const passwordIsEmpty = password.length === 0;

  let strengthLabel = "Weak";
  let strengthColor = "bg-red-500";
  if (strength >= 0.7) {
    strengthLabel = "Strong";
    strengthColor = "bg-green-500";
  } else if (strength >= 0.4) {
    strengthLabel = "Fair";
    strengthColor = "bg-yellow-400";
  }

  return (
    // The outer container with background and padding has been removed
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              passwordIsEmpty ? "bg-transparent" : strengthColor
            }`}
            style={{ width: `${strength * 100}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-600 font-inter w-12 text-right">
          {passwordIsEmpty ? "" : strengthLabel}
        </span>
      </div>

      {/* Rules Checklist */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs font-inter">
        {rules.map((rule) => {
          const passed = rule.test(password);
          return (
            <li
              key={rule.label}
              className={`flex items-center gap-1.5 transition-colors ${
                passwordIsEmpty
                  ? "text-gray-500"
                  : passed
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {passed ? (
                <CheckCircleIcon className="w-4 h-4" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-gray-300" />
              )}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}