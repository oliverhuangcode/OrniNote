import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted:", formData);
    // Navigate to dashboard after successful login
    navigate("/dashboard");
  };

  const handleGoogleSignin = () => {
    console.log("Google signin clicked");
    // Navigate to dashboard after Google sign-in
    navigate("/dashboard");
  };

  const handleGitHubSignin = () => {
    console.log("GitHub signin clicked");
    // Navigate to dashboard after GitHub sign-in
    navigate("/dashboard");
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
          {/* Glass background effect */}
          <div className="relative">
            {/* Blurred background layer */}
            <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-md rounded-3xl transform translate-x-4 translate-y-4 lg:translate-x-6 lg:translate-y-6"></div>
            
            {/* Main form container */}
            <div className="relative bg-white rounded-3xl p-6 lg:p-8 xl:p-12 shadow-2xl">
              <h2 className="font-jetbrains font-bold text-ml-dark text-2xl lg:text-3xl xl:text-4xl mb-6 lg:mb-8">
                Sign In
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                {/* Username or Email */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-2 text-ml-gray font-jetbrains text-sm font-medium">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    name="usernameOrEmail"
                    value={formData.usernameOrEmail}
                    onChange={handleInputChange}
                    className="w-full h-12 lg:h-14 px-4 border border-ml-gray rounded-md bg-white font-jetbrains focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent"
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
                    className="w-full h-12 lg:h-14 px-4 border border-ml-gray rounded-md bg-white font-jetbrains focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent"
                  />
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  className="w-full h-12 lg:h-14 bg-highlight text-white font-jetbrains font-extrabold text-xl lg:text-2xl rounded-md hover:bg-opacity-90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                </button>

                {/* Social Login Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
                  <button
                    type="button"
                    onClick={handleGoogleSignin}
                    className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    </div>
                    <span className="font-jetbrains font-medium text-sm text-gray-700">
                      Sign in with Google
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGitHubSignin}
                    className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    </div>
                    <span className="font-jetbrains font-medium text-sm text-gray-700">
                      Sign in with GitHub
                    </span>
                  </button>
                </div>
              </form>

              {/* Signup Link */}
              <div className="text-center mt-6">
                <p className="text-ml-gray font-jetbrains text-sm">
                  Don't have an account?{" "}
                  <Link 
                    to="/" 
                    className="text-highlight hover:underline font-medium"
                  >
                    Create one here
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
