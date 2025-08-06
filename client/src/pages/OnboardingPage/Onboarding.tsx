import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement account creation logic
    navigate('/dashboard');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSocialSignup = (provider: 'google' | 'github') => {
    // TODO: Implement social signup
    console.log(`Sign up with ${provider}`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green via-brand-green to-white flex items-center justify-center p-4">
      {/* Background Cards */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-[776px] h-[772px] rounded-[30px] bg-white/50 backdrop-blur-[12px] absolute translate-x-[53px] translate-y-[56px]" />
        <div className="w-[776px] h-[772px] rounded-[30px] bg-white absolute" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center">
        {/* Left Side - Title */}
        <div className="flex-1 pr-8">
          <h1 className="text-white font-mono text-4xl md:text-6xl font-extrabold leading-none uppercase">
            Machine<br />
            Learning<br />
            Focused<br />
            Annotation<br />
            Tool
          </h1>
        </div>

        {/* Right Side - Form */}
        <div className="w-full max-w-[640px] bg-white rounded-[30px] p-12 relative z-20">
          <h2 className="text-4xl font-mono font-bold text-brand-gray-800 mb-8">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First and Last Name Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full h-[50px] rounded-md border border-brand-gray-500 bg-white px-4 pt-6 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
                <label className="absolute left-4 top-2 text-xs text-brand-gray-500 font-mono">
                  First Name
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full h-[50px] rounded-md border border-brand-gray-500 bg-white px-4 pt-6 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
                <label className="absolute left-4 top-2 text-xs text-brand-gray-500 font-mono">
                  Last Name
                </label>
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full h-[50px] rounded-md border border-brand-gray-500 bg-white px-4 pt-6 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                required
              />
              <label className="absolute left-4 top-2 text-xs text-brand-gray-500 font-mono">
                Email
              </label>
            </div>

            {/* Username */}
            <div className="relative">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full h-[50px] rounded-md border border-brand-gray-500 bg-white px-4 pt-6 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                required
              />
              <label className="absolute left-4 top-2 text-xs text-brand-gray-500 font-mono">
                Username
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full h-[50px] rounded-md border border-brand-gray-500 bg-white px-4 pt-6 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                required
              />
              <label className="absolute left-4 top-2 text-xs text-brand-gray-500 font-mono">
                Password
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              className="w-full h-[50px] rounded-md bg-brand-green text-white text-2xl font-mono font-extrabold hover:bg-brand-green-dark transition-colors"
            >
              Create Account
            </button>

            {/* Social Signup */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                type="button"
                onClick={() => handleSocialSignup('google')}
                className="h-[50px] rounded-lg bg-brand-blue text-white text-xl font-mono font-medium hover:opacity-90 transition-opacity"
              >
                Sign up with Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignup('github')}
                className="h-[50px] rounded-lg bg-brand-gray-800 text-white text-xl font-mono font-medium hover:opacity-90 transition-opacity"
              >
                Sign up with GitHub
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
