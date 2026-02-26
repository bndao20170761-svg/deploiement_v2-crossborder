import React from 'react';
import { Button } from './common';

const NotificationDropdown = ({ isOpen, onClose }) => {
  // Rediriger vers la page des notifications
  const handleViewNotifications = () => {
    onClose();
    window.location.href = '/notifications';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* En-tête */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Notifications
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Voir toutes les notifications
            </h3>
            <p className="text-gray-500 mb-6">
              Accédez à une page dédiée pour gérer toutes vos notifications de commentaires.
            </p>
            
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={handleViewNotifications}
                className="flex-1"
              >
                Ouvrir la page des notifications
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;