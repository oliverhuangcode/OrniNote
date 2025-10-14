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

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth route
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleGitHubSignIn = () => {
    // Redirect to backend GitHub OAuth route
    window.location.href = 'http://localhost:5000/api/auth/github';
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-highlight via-highlight to-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        <div className="flex-1 max-w-xl animate-fade-in-up">
          <h1 className="font-jetbrains font-bold text-white text-5xl lg:text-6xl mb-4">
            OrniNote
          </h1>
          <p className="text-white/90 text-lg font-inter">
            Collaborative image annotation made simple
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

              <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-jetbrains font-medium text-[13.5px] text-gray-700">
                    Sign in with Google
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={handleGitHubSignIn}
                  className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span className="font-jetbrains font-medium text-[13.5px] text-gray-700">
                    Sign in with GitHub
                  </span>
                </button>
              </div>

              <div className="text-center mt-2 pt-6 border-t border-gray-100">
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