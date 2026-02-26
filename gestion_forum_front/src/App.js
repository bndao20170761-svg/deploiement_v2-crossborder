import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TopicsPage from './pages/TopicsPage';
import CreateTopicPage from './pages/CreateTopicPage';
import TopicDetailPage from './pages/TopicDetailPage';
import MyTopicsPage from './pages/MyTopicsPage';
import NotificationsPage from './pages/NotificationsPage';
import EditTopicPage from './pages/EditTopicPage';

function App() {
  // Navigation basée sur l'URL avec état React
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Écouter les changements d'URL
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Écouter les changements d'URL
    window.addEventListener('popstate', handleLocationChange);
    
    // Vérifier l'URL actuelle périodiquement (pour les changements programmatiques)
    const interval = setInterval(() => {
      if (window.location.pathname !== currentPath) {
        setCurrentPath(window.location.pathname);
      }
    }, 100);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, [currentPath]);

  const renderPage = () => {
    console.log('App.js - Chemin actuel:', currentPath);
    
    // Vérifier si c'est une page de modification de sujet (doit être vérifié en premier)
    if (currentPath.startsWith('/topics/') && currentPath.endsWith('/edit')) {
      console.log('App.js - Redirection vers EditTopicPage');
      return <EditTopicPage />;
    }
    
    // Vérifier si c'est une page de détail de sujet (avec un ID valide)
    if (currentPath.startsWith('/topics/') && currentPath !== '/topics') {
      const pathParts = currentPath.split('/');
      const topicId = pathParts[2];
      
      console.log('App.js - Vérification page de détail, topicId:', topicId);
      
      // Routes spéciales qui ne sont pas des pages de détail
      const specialRoutes = ['create', 'my-topics', 'recent', 'popular', 'active'];
      if (!specialRoutes.includes(topicId)) {
        console.log('App.js - Redirection vers TopicDetailPage');
        return <TopicDetailPage />;
      }
    }

    switch (currentPath) {
      case '/':
        return <HomePage />;
      case '/login':
        return <LoginPage />;
      case '/register':
        return <RegisterPage />;
      case '/topics':
        return <TopicsPage />;
      case '/topics/create':
        return <CreateTopicPage />;
      case '/topics/my-topics':
        return <MyTopicsPage />;
      case '/notifications':
        return <NotificationsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="App">
          {renderPage()}
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
