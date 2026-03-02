import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotificationCount = async () => {
    if (!isAuthenticated || !user?.id) {
      setNotificationCount(0);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/commentaires/notifications/${user.id}/count`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const count = await response.json();
      setNotificationCount(count);
    } catch (err) {
      console.error('Erreur lors de la récupération du nombre de notifications:', err);
      setNotificationCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useNotifications - État auth:', { isAuthenticated, userId: user?.id });
    fetchNotificationCount();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  const refreshNotifications = () => {
    fetchNotificationCount();
  };

  return {
    notificationCount,
    loading,
    refreshNotifications
  };
};
