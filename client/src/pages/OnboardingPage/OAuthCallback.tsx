import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Save the token
      authService.setToken(token);
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // Handle error
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-highlight via-highlight to-white flex items-center justify-center">
      <div className="text-white text-xl font-inter">Processing authentication...</div>
    </div>
  );
}