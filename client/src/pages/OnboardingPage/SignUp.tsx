import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await signup(formData.username, formData.email, formData.password);
      
      if (result.success) {
        navigate("/dashboard", { replace: true });
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-highlight via-highlight to-white flex items-center justify-center p-8 lg:p-16 xl:p-24">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        
        {/* Left side - Title */}
        <div className="flex-1 max-w-xl">
          <h1 className="font-jetbrains font-bold text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-4">
            OrniNote
          </h1>
          <p className="text-white/90 text-lg lg:text-xl font-inter leading-relaxed">
            Precision annotation tools designed for ornithologists and bird researchers
          </p>
        </div>

        {/* Right side - Form */}
        <div className="flex-shrink-0 w-full max-w-md lg:max-w-lg">
          <div className="relative">
            {/* Blurred background layer */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-2xl transform translate-x-3 translate-y-3"></div>
            
            {/* Main form container */}
            <div className="relative bg-white rounded-2xl p-8 lg:p-10 shadow-xl">
              <div className="mb-8">
                <h2 className="font-jetbrains font-bold text-gray-900 text-2xl lg:text-3xl mb-2">
                  Create an account
                </h2>
                <p className="text-gray-500 text-sm font-inter">
                  Get started with your annotation projects
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-inter">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white px-2 text-gray-600 font-inter text-sm font-medium">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    minLength={3}
                    maxLength={30}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white font-inter text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white px-2 text-gray-600 font-inter text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white font-inter text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-colors"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white px-2 text-gray-600 font-inter text-sm font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white font-inter text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-colors"
                  />
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white px-2 text-gray-600 font-inter text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white font-inter text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-colors"
                  />
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-highlight text-white font-inter font-semibold text-sm rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-8 pt-6 border-t border-gray-100">
                <p className="text-gray-600 font-inter text-sm">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-highlight hover:text-green-700 font-semibold transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}