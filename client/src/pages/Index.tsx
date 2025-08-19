import { useState } from "react";
import { Link } from "react-router-dom";

export default function Index() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleGoogleSignup = () => {
    console.log("Google signup clicked");
  };

  const handleGitHubSignup = () => {
    console.log("GitHub signup clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ml-green via-ml-green to-white flex items-center justify-center p-4 lg:p-8">
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
                Create Account
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                {/* First Name and Last Name row */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <label className="absolute -top-2 left-3 bg-white px-2 text-ml-gray font-jetbrains text-sm font-medium">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full h-12 lg:h-14 px-4 border border-ml-gray rounded-md bg-white font-jetbrains focus:outline-none focus:ring-2 focus:ring-ml-green focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <label className="absolute -top-2 left-3 bg-white px-2 text-ml-gray font-jetbrains text-sm font-medium">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full h-12 lg:h-14 px-4 border border-ml-gray rounded-md bg-white font-jetbrains focus:outline-none focus:ring-2 focus:ring-ml-green focus:border-transparent"
                    />
                  </div>
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
                    className="w-full h-12 lg:h-14 px-4 border border-ml-gray rounded-md bg-white font-jetbrains focus:outline-none focus:ring-2 focus:ring-ml-green focus:border-transparent"
                  />
                </div>

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
                    className="w-full h-12 lg:h-14 px-4 border border-ml-gray rounded-md bg-white font-jetbrains focus:outline-none focus:ring-2 focus:ring-ml-green focus:border-transparent"
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
                    className="w-full h-12 lg:h-14 px-4 border border-ml-gray rounded-md bg-white font-jetbrains focus:outline-none focus:ring-2 focus:ring-ml-green focus:border-transparent"
                  />
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  className="w-full h-12 lg:h-14 bg-ml-green text-white font-jetbrains font-extrabold text-xl lg:text-2xl rounded-md hover:bg-opacity-90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create Account
                </button>

                {/* Social Login Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
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
                    onClick={handleGitHubSignup}
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

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-ml-gray font-jetbrains text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-ml-green hover:underline font-medium"
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
