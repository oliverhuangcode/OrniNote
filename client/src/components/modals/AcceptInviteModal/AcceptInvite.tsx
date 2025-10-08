import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const AcceptInvite = () => {
  const location = useLocation();
  const [status, setStatus] = useState('Processing invite...');
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (!token) {
      setStatus('Invalid invite link.');
      return;
    }

    const acceptInvite = async () => {
      try {
        console.log('Accepting invite with token:', token);
        
        const response = await fetch(`${API_BASE_URL}/invite/accept?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Accept invite response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Accept invite error:', errorText);
          setStatus('Failed to accept invite. Please try again.');
          return;
        }

        const result = await response.json();
        console.log('Accept invite result:', result);

        if (!result.success) {
          setStatus(result.message || result.error || 'Failed to accept invite.');
          return;
        }

        if (result.action === "redirectToLogin") {
          // Redirect to login with prefilled email
          setStatus('Redirecting to login...');
          setTimeout(() => {
            window.location.href = `/login?email=${encodeURIComponent(result.email)}`;
          }, 1000);
        } else if (result.action === "redirectToProject") {
          // Redirect to project page
          setStatus('Invite accepted! Redirecting to project...');
          setTimeout(() => {
            window.location.href = `/annotation/${result.projectId}`;
          }, 1000);
        }
      } catch (err) {
        console.error('Accept invite error:', err);
        setStatus('Error processing invite. Please try again.');
      }
    };

    acceptInvite();
  }, [token]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-highlight via-highlight to-white">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-4">
            {status.includes('Processing') || status.includes('Redirecting') ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto"></div>
            ) : status.includes('Error') || status.includes('Failed') || status.includes('Invalid') ? (
              <div className="text-red-500 text-4xl mb-2">⚠️</div>
            ) : (
              <div className="text-green-500 text-4xl mb-2">✓</div>
            )}
          </div>
          <p className="text-lg font-medium text-gray-900 font-jetbrains">{status}</p>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;