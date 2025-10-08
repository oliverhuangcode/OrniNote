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
    <div className="min-h-screen bg-gradient-to-br from-highlight via-highlight to-white flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
        
        {/* Left side - Title */}
        <div className="flex-1 max-w-2xl">
          <h1 className="font-jetbrains font-extrabold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-wide">
            MACHINE LEARNING FOCUSED ANNOTATION TOOL
          </h1>
        </div>

        {/* Right side - Form */}
        <div className="flex-shrink-0 w-full max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-md rounded-3xl transform translate-x-4 translate-y-4 lg:translate-x-6 lg:translate-y-6"></div>
            
            <div className="relative bg-white rounded-3xl p-6 lg:p-8 xl:p-12 shadow-2xl">
              <h2 className="font-jetbrains font-bold text-ml-dark text-2xl lg:text-3xl xl:text-4xl mb-6 lg:mb-8">
                Sign Up
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                {/* Username */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-2 text-ml-gray font-jetbrains text-sm font-medium">
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
                    className="w-full h-12 lg:h-14 px-4 border border-ml-gray rounded-md bg-white font-jetbrains focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent disabled:opacity-50"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-2 text-ml-gray font-jetbrains text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="w-full h-12 lg:h-14 px-4 border border-ml-gray rounded-md bg-white font-jetbrains focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent disabled:opacity-50"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-2 text-ml-gray font-jetbrains text-sm font-medium">
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
                    className="w-full h-12 lg:h-14 px-4 border border-ml-gray rounded-md bg-white font-jetbrains focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent disabled:opacity-50"
                  />
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-2 text-ml-gray font-jetbrains text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="w-full h-12 lg:h-14 px-4 border border-ml-gray rounded-md bg-white font-jetbrains focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent disabled:opacity-50"
                  />
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 lg:h-14 bg-highlight text-white font-jetbrains font-extrabold text-xl lg:text-2xl rounded-md hover:bg-opacity-90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-ml-gray font-jetbrains text-sm">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-highlight hover:underline font-medium"
                  >
                    Sign in here
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