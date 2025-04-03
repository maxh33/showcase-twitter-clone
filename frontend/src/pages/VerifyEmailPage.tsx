import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { handleEmailVerification } from '../services/verificationService';

const VerifyEmailPage: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!uid || !token) {
          throw new Error('Missing verification parameters');
        }
        
        await handleEmailVerification({
          uidb64: uid,
          token: token
        });
        
        navigate('/login');
      } catch (error) {
        console.error('Email verification failed:', error);
        navigate('/login');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [uid, token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {isVerifying ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Verifying your email...</h2>
        </div>
      ) : null}
    </div>
  );
};

export default VerifyEmailPage; 