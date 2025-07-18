import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: 'login' | 'register' | 'forgot-password';
}

type AuthMode = 'login' | 'register' | 'forgot-password';

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultMode = 'login' 
}) => {
  const [currentMode, setCurrentMode] = useState<AuthMode>(defaultMode);
  const [isVisible, setIsVisible] = useState(false);

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Prevent modal from closing accidentally
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    console.log('🔄 AuthModal closing');
    setCurrentMode('login'); // Reset to login when closing
    onClose();
  };

  const handleSuccess = () => {
    console.log('✅ Auth success, calling onSuccess callback');
    if (onSuccess) onSuccess();
    handleClose();
  };

  // Don't render if not open
  if (!isOpen && !isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎌</div>
            <h1 className="text-lg font-semibold text-gray-900">
              {currentMode === 'login' && 'Sign In'}
              {currentMode === 'register' && 'Create Account'}
              {currentMode === 'forgot-password' && 'Reset Password'}
            </h1>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {currentMode === 'login' && (
            <LoginForm
              onSwitchToRegister={() => setCurrentMode('register')}
              onSwitchToForgotPassword={() => setCurrentMode('forgot-password')}
              onClose={handleSuccess}
            />
          )}

          {currentMode === 'register' && (
            <RegisterForm
              onSwitchToLogin={() => setCurrentMode('login')}
              onClose={handleSuccess}
            />
          )}

          {currentMode === 'forgot-password' && (
            <ForgotPasswordForm
              onSwitchToLogin={() => setCurrentMode('login')}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;