import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, Input, Select, Card, Alert } from '../components/common';
import Navbar from '../components/Navbar';

const RegisterPage = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    nationalite: '',
    profil: 'USER',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const nationalities = [
    { value: 'fr', label: '🇫🇷 France' },
    { value: 'sn', label: '🇸🇳 Sénégal' },
    { value: 'ci', label: '🇨🇮 Côte d\'Ivoire' },
    { value: 'ml', label: '🇲🇱 Mali' },
    { value: 'bf', label: '🇧🇫 Burkina Faso' },
    { value: 'gn', label: '🇬🇳 Guinée' },
    { value: 'cm', label: '🇨🇲 Cameroun' },
    { value: 'cg', label: '🇨🇬 Congo' },
    { value: 'ga', label: '🇬🇦 Gabon' },
    { value: 'td', label: '🇹🇩 Tchad' },
    { value: 'cf', label: '🇨🇫 République Centrafricaine' },
    { value: 'ne', label: '🇳🇪 Niger' },
    { value: 'tg', label: '🇹🇬 Togo' },
    { value: 'bj', label: '🇧🇯 Bénin' },
    { value: 'other', label: '🌍 Autre' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) newErrors.username = 'Le nom d\'utilisateur est requis';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom) newErrors.prenom = 'Le prénom est requis';
    if (!formData.nationalite) newErrors.nationalite = 'La nationalité est requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData);

      if (result.success) {
        window.location.href = '/';
      } else {
        setErrors({ general: result.error });
      }
    } catch (err) {
      setErrors({ general: 'Une erreur inattendue s\'est produite' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vih-light via-white to-blue-50">
      <Navbar />

      <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-vih-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 font-heading">
              {t('auth.register_title')}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Ou{' '}
              <a href="/login" className="font-medium text-vih-primary hover:text-vih-secondary">
                {t('auth.have_account')}
              </a>
            </p>
          </div>

          <Card className="shadow-xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <Alert variant="error">
                  {errors.general}
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('auth.first_name')}
                  name="prenom"
                  required
                  value={formData.prenom}
                  onChange={handleChange}
                  error={errors.prenom}
                  placeholder="Votre prénom"
                />

                <Input
                  label={t('auth.last_name')}
                  name="nom"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  error={errors.nom}
                  placeholder="Votre nom"
                />
              </div>

              <Input
                label={t('auth.username')}
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                placeholder="votre_nom_utilisateur"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('auth.password')}
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••"
                />

                <Input
                  label="Confirmer le mot de passe"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                />
              </div>

              <Select
                label={t('auth.nationality')}
                name="nationalite"
                required
                value={formData.nationalite}
                onChange={handleChange}
                error={errors.nationalite}
                options={nationalities}
              />

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Profil utilisateur
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="profil"
                      value="USER"
                      checked={formData.profil === 'USER'}
                      onChange={handleChange}
                      className="h-4 w-4 text-vih-primary focus:ring-vih-primary border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Utilisateur standard - Participer aux discussions
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="profil"
                      value="TRADUCTEUR"
                      checked={formData.profil === 'TRADUCTEUR'}
                      onChange={handleChange}
                      className="h-4 w-4 text-vih-primary focus:ring-vih-primary border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Traducteur - Aider à la traduction des contenus
                    </span>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
              >
                {t('auth.register_button')}
              </Button>
            </form>
          </Card>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              En créant votre compte, vous acceptez nos{' '}
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

export default RegisterPage;
