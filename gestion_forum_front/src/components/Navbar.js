import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './common';
import { useNotifications } from '../hooks/useNotifications';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { notificationCount, refreshNotifications } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isTopicsMenuOpen, setIsTopicsMenuOpen] = useState(false);

  const navigationItems = [
    { key: 'home', label: t('nav.home'), href: '/', requiresAuth: false },
    { key: 'forums', label: t('nav.forums'), href: '/forums', requiresAuth: false },
    ...(isAuthenticated
      ? [{ key: 'topics', label: t('nav.topics'), href: '#', requiresAuth: true, isDropdown: true }]
      : []),
    ...(isAuthenticated && user?.profil === 'TRADUCTEUR'
      ? [{ key: 'translators', label: t('nav.translators'), href: '/translators', requiresAuth: true }]
      : []),
    ...(isAuthenticated && (user?.profil === 'ADMIN' || user?.profil === 'MODERATEUR')
      ? [{ key: 'admin', label: t('nav.admin'), href: '/admin', requiresAuth: true }]
      : []),
  ];

  // Fonctions de navigation vers les autres microservices
  const handleFrontend1Click = () => {
    window.location.href = process.env.REACT_APP_FRONTEND1_URL || 'http://localhost:3001';
  };

  const handleFrontend2Click = () => {
    window.location.href = process.env.REACT_APP_FRONTEND2_URL || 'http://localhost:3002';
  };

  // Fermer les dropdowns quand on clique en dehors
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.topics-dropdown') && !event.target.closest('.profile-dropdown')) {
        setIsTopicsMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et nom du site */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-vih-primary rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-heading">
                VIH Forum
              </h1>
              <p className="text-xs text-gray-500">
                {t('home.subtitle')}
              </p>
            </div>
          </div>

          {/* Navigation principale - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              item.isDropdown ? (
                <div key={item.key} className="relative topics-dropdown">
                  <button
                    onClick={() => setIsTopicsMenuOpen(!isTopicsMenuOpen)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-vih-primary hover:bg-vih-light rounded-lg transition-colors duration-200 flex items-center"
                  >
                    {item.label}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {isTopicsMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50 border">
                      <a
                        href="/topics/create"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsTopicsMenuOpen(false)}
                      >
                        {t('nav.topics_create')}
                      </a>
                      <a
                        href="/topics/my-topics"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsTopicsMenuOpen(false)}
                      >
                        {t('nav.topics_my')}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={item.key}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-vih-primary hover:bg-vih-light rounded-lg transition-colors duration-200"
                >
                  {item.label}
                </a>
              )
            ))}
          </div>

          {/* Sélecteur de langue et authentification */}
          <div className="flex items-center space-x-3">
            {/* Sélecteur de langue */}
            <div className="relative">
              <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-vih-primary focus:border-transparent"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
                <option value="pt">🇵🇹 Português</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Bouton des notifications - redirection directe */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  refreshNotifications();
                  window.location.href = '/notifications';
                }}
                className="relative p-2 text-gray-600 hover:text-vih-primary hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Voir les notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM15 7h5l-5-5v5zM12 14c1.66 0 3-1.34 3-3V5H9v6c0 1.66 1.34 3 3 3z" />
                </svg>
                {/* Badge de notification dynamique */}
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Navigation vers les autres microservices */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleFrontend1Click}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Aller à Frontend-1 (Port 3001)"
              >
                <span className="text-sm font-medium">🚀 F1</span>
              </button>
              
              <button
                onClick={handleFrontend2Click}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                title="Aller à Frontend-2 (Port 3002)"
              >
                <span className="text-sm font-medium">🚀 F2</span>
              </button>
            </div>

            {/* Menu d'authentification */}
            {isAuthenticated ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-vih-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.prenom?.[0]}{user?.nom?.[0]}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.prenom} {user?.nom}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Menu déroulant du profil */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50 border">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      {t('nav.profile')}
                    </a>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                  <Button size="sm" onClick={() => window.location.href = "/login"}>
                    {t('nav.login')}
                  </Button>
                  <Button size="sm" onClick={() => window.location.href = "/register"}>
                    {t('nav.register')}
                  </Button>
              </div>
            )}

            {/* Menu mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                item.isDropdown ? (
                  <div key={item.key}>
                    <div className="px-3 py-2 text-base font-medium text-gray-900 border-b border-gray-200">
                      {item.label}
                    </div>
                    <div className="ml-4 space-y-1">
                      <a
                        href="/topics/create"
                        className="block px-3 py-2 text-sm text-gray-700 hover:text-vih-primary hover:bg-vih-light rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t('nav.topics_create')}
                      </a>
                      <a
                        href="/topics/my-topics"
                        className="block px-3 py-2 text-sm text-gray-700 hover:text-vih-primary hover:bg-vih-light rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t('nav.topics_my')}
                      </a>
                    </div>
                  </div>
                ) : (
                  <a
                    key={item.key}
                    href={item.href}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-vih-primary hover:bg-vih-light rounded-lg"
                    onClick={() => {
                      setIsTopicsMenuOpen(false);
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </a>
                )
              ))}

              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => {
                    window.location.href = "/login";
                    setIsTopicsMenuOpen(false);
                    setIsProfileMenuOpen(false);
                  }}>
                    {t('nav.login')}
                  </Button>
                  <Button className="w-full" onClick={() => {
                    window.location.href = "/register";
                    setIsTopicsMenuOpen(false);
                    setIsProfileMenuOpen(false);
                  }}>
                    {t('nav.register')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </nav>
  );
};

export default Navbar;
