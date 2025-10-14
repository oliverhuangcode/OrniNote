import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signin, isAuthenticated } = useAuth();
  
  const params = new URLSearchParams(location.search);
  const emailFromInvite = params.get("email") || "";
  
  const [formData, setFormData] = useState({
    usernameOrEmail: emailFromInvite,
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Prefill email if query param exists
  useEffect(() => {
    if (emailFromInvite) {
      setFormData(prev => ({ ...prev, usernameOrEmail: emailFromInvite }));
    }
  }, [emailFromInvite]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signin(formData.usernameOrEmail, formData.password);
      
      if (result.success) {
        // Navigate to the page they were trying to access, or dashboard
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = () => {
    alert('Google sign-in coming soon!');
  };

  const handleGitHubSignin = () => {
    alert('GitHub sign-in coming soon!');
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
          {/* Glass background effect */}
          <div className="relative">
            {/* Blurred background layer */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-2xl transform translate-x-3 translate-y-3"></div>
            
            {/* Main form container */}
            <div className="relative bg-white rounded-2xl p-8 lg:p-10 shadow-xl">
              <div className="mb-8">
                <h2 className="font-jetbrains font-bold text-gray-900 text-2xl lg:text-3xl mb-2">
                  Welcome back
                </h2>
                <p className="text-gray-500 text-sm font-inter">
                  Sign in to continue to your projects
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-inter">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username or Email */}
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white px-2 text-gray-600 font-inter text-sm font-medium">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    name="usernameOrEmail"
                    value={formData.usernameOrEmail}
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
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white font-inter text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-colors"
                  />
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-highlight text-white font-inter font-semibold text-sm rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-inter">Or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignin}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-inter font-medium text-sm text-gray-700">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGitHubSignin}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-inter font-medium text-sm text-gray-700">GitHub</span>
                  </button>
                </div>
              </form>

              {/* Signup Link */}
              <div className="text-center mt-8 pt-6 border-t border-gray-100">
                <p className="text-gray-600 font-inter text-sm">
                  Don't have an account?{" "}
                  <Link 
                    to="/signup" 
                    className="text-highlight hover:text-green-700 font-semibold transition-colors"
                  >
                    Sign up
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