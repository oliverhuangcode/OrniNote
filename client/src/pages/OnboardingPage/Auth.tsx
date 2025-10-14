// src/pages/Auth/Auth.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import PasswordStrength from "./components/PasswordStrength";
import ValidatedInput from "./components/ValidatedInput";

type AuthMode = "login" | "signup";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signin, signup, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<AuthMode>(
    location.pathname === "/signup" ? "signup" : "login"
  );

  const params = new URLSearchParams(location.search);
  const emailFromInvite = params.get("email") || "";

  const [formData, setFormData] = useState({
    username: "",
    usernameOrEmail: emailFromInvite,
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const passwordRules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase", test: (p: string) => /[a-z]/.test(p) },
    { label: "One number", test: (p: string) => /\d/.test(p) },
    { label: "One special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    { label: "No spaces", test: (p: string) => !/\s/.test(p) },
  ];

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const allPasswordRulesPass = passwordRules.every((r) => r.test(formData.password));

  const canSubmit = mode === "login"
    ? formData.usernameOrEmail && formData.password && !loading
    : emailValid && allPasswordRulesPass && formData.username && !loading;

  // ... (all useEffects and handlers remain the same) ...
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
      .animation-delay-150 { animation-delay: 0.15s; opacity: 0; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    setMode(location.pathname === "/signup" ? "signup" : "login");
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const result = await signup(formData.username, formData.email, formData.password);
        if (result.success) {
          navigate("/dashboard", { replace: true });
        } else {
          setError(result.error || "Signup failed");
        }
      } else {
        const result = await signin(formData.usernameOrEmail, formData.password);
        if (result.success) {
          const from = (location.state as any)?.from?.pathname || "/dashboard";
          navigate(from, { replace: true });
        } else {
          setError(result.error || "Login failed");
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-highlight via-highlight to-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        <div className="flex-1 max-w-xl animate-fade-in-up">
          <h1 className="font-jetbrains font-bold text-white text-5xl lg:text-6xl mb-4">
            OrniNote
          </h1>
          <p className="text-white/90 text-lg font-inter">
            Precision annotation tools for ornithologists
          </p>
        </div>

        <div className="flex-shrink-0 w-full max-w-md animate-fade-in-up animation-delay-150">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-2xl translate-x-3 translate-y-3 transition-all group-hover:translate-x-2 group-hover:translate-y-2"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-xl group-hover:shadow-2xl transition-all">
              <h2 className="font-jetbrains font-bold text-gray-900 text-2xl mb-2">
                {mode === "login" ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-gray-500 text-sm font-inter mb-6">
                {mode === "login"
                  ? "Sign in to continue"
                  : "Set up your account for OrniNote"}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-inter">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Username"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-highlight focus:border-transparent font-inter text-sm"
                  />
                )}

                {mode === "login" ? (
                  <input
                    type="text"
                    name="usernameOrEmail"
                    value={formData.usernameOrEmail}
                    onChange={handleInputChange}
                    required
                    placeholder="Username or Email"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-highlight focus:border-transparent font-inter text-sm"
                  />
                ) : (
                  <ValidatedInput
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    isTouched={formData.email.length > 0}
                    isValid={emailValid}
                  />
                )}

                <div className="relative">
                  <ValidatedInput
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    isTouched={mode === "signup" && formData.password.length > 0}
                    isValid={allPasswordRulesPass}
                  />
                  {/* This is the change: only show the button if there is text */}
                  {formData.password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      // Adjust margin to account for the validation icon appearing later
                      className="absolute inset-y-0 right-0 flex items-center pr-3 mr-8 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>

                {mode === "signup" && (
                  <PasswordStrength password={formData.password} rules={passwordRules} />
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`w-full py-3 font-inter font-semibold text-sm rounded-lg transition-all shadow-sm 
                    ${
                      canSubmit
                        ? "bg-highlight text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  {loading
                    ? mode === "login"
                      ? "Signing in..."
                      : "Creating account..."
                    : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
                </button>
              </form>

              <div className="text-center mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-600 font-inter text-sm">
                  {mode === "login"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    onClick={() =>
                      navigate(mode === "login" ? "/signup" : "/login", {
                        replace: true,
                      })
                    }
                    className="text-highlight hover:text-green-700 font-semibold transition-colors"
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}