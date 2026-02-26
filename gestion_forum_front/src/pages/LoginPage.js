import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, Input, Card, Alert } from '../components/common';
import Navbar from '../components/Navbar';

const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        window.location.href = '/';
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vih-light via-white to-blue-50">
      <Navbar />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-vih-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 font-heading">
              {t('auth.login_title')}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Ou{' '}
              <a href="/register" className="font-medium text-vih-primary hover:text-vih-secondary">
                {t('auth.no_account')}
              </a>
            </p>
          </div>

          <Card className="shadow-xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="error">
                  {error}
                </Alert>
              )}

              <Input
                label={t('auth.email')}
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="votre.email@exemple.com"
              />

              <Input
                label={t('auth.password')}
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-vih-primary focus:ring-vih-primary border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <a href="/forgot-password" className="font-medium text-vih-primary hover:text-vih-secondary">
                    Mot de passe oublié ?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
              >
                {t('auth.login_button')}
              </Button>
            </form>
          </Card>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              En vous connectant, vous acceptez nos{' '}
              <a href="/terms" className="font-medium text-vih-primary hover:text-vih-secondary">
                conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="/privacy" className="font-medium text-vih-primary hover:text-vih-secondary">
                politique de confidentialité
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
