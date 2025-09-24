import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

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
        const response = await fetch(`/api/invite/accept?token=${token}`);
        const result = await response.json();

        if (!result.success) {
          setStatus(result.message || 'Failed to accept invite.');
          return;
        }

        if (result.action === "redirectToLogin") {
          // Redirect to login with prefilled email
          window.location.href = `/login?email=${encodeURIComponent(result.email)}`;
        } else if (result.action === "redirectToProject") {
          // Redirect to project page
          window.location.href = `/annotation/${result.projectId}`;
        }

      } catch (err) {
        console.error(err);
        setStatus('Error processing invite.');
      }
    };

    acceptInvite();
  }, [token]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-medium">{status}</p>
    </div>
  );
};

export default AcceptInvite;
