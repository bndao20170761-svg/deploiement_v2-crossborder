import React, { createContext, useContext, useState, useEffect } from 'react';

// Contexte pour la gestion des langues
const LanguageContext = createContext();

const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.forums': 'Forums',
    'nav.topics': 'Sujets',
    'nav.topics_create': 'Publier un sujet',
    'nav.topics_my': 'Mes sujets',
    'nav.translators': 'Traducteurs',
    'nav.admin': 'Administration',
    'nav.profile': 'Profil',
    'nav.login': 'Connexion',
    'nav.register': 'Inscription',
    'nav.logout': 'Déconnexion',
    // Accueil
    'home.title': '',
    'home.subtitle': '',
    'home.description': '',
    'home.featured_topics': 'Sujets en vedette',
    'home.recent_topics': 'Sujets récents',
    'home.join_community': '',
    'home.community_description': '',

    // Authentification
    'auth.login_title': 'Connexion',
    'auth.register_title': 'Inscription',
    'auth.password': 'Mot de passe',
    'auth.username': 'Nom d\'utilisateur',
    'auth.first_name': 'Prénom',
    'auth.last_name': 'Nom',
    'auth.nationality': 'Nationalité',
    'auth.login_button': 'Se connecter',
    'auth.register_button': 'S\'inscrire',
    'auth.no_account': 'Pas encore de compte ?',
    'auth.have_account': 'Déjà un compte ?',

    // Sujets
    'topics.title': 'Sujets',
    'topics.create_new': 'Créer un sujet',
    'topics.search': 'Rechercher...',
    'topics.views': 'Vues',
    'topics.replies': 'Réponses',
    'topics.last_reply': 'Dernière réponse',
    'topics.by': 'par',
    'topics.no_topics': 'Aucun sujet trouvé',

    // Commentaires
    'comments.reply': 'Répondre',
    'comments.edit': 'Modifier',
    'comments.delete': 'Supprimer',
    'comments.report': 'Signaler',
    'comments.no_comments': 'Aucun commentaire',

    // Traduction
    'translation.request': 'Demander une traduction',
    'translation.pending': 'En attente',
    'translation.in_progress': 'En cours',
    'translation.completed': 'Terminée',

    // Général
    'general.loading': 'Chargement...',
    'general.error': 'Erreur',
    'general.success': 'Succès',
    'general.cancel': 'Annuler',
    'general.save': 'Enregistrer',
    'general.edit': 'Modifier',
    'general.delete': 'Supprimer',
    'general.confirm': 'Confirmer',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.forums': 'Forums',
    'nav.topics': 'Topics',
    'nav.topics_create': 'Create Topic',
    'nav.topics_my': 'My Topics',
    'nav.translators': 'Translators',
    'nav.admin': 'Administration',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'home.title': 'Multilingual HIV Forum',
    'home.subtitle': 'Exchange and support space for the community',
    'home.description': 'Join our community to share experiences, advice and mutual support.',
    'home.featured_topics': 'Featured Topics',
    'home.recent_topics': 'Recent Topics',
    'home.join_community': 'Join the Community',

    // Authentication
    'auth.login_title': 'Login',
    'auth.register_title': 'Register',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.first_name': 'First Name',
    'auth.last_name': 'Last Name',
    'auth.nationality': 'Nationality',
    'auth.login_button': 'Sign In',
    'auth.register_button': 'Sign Up',
    'auth.no_account': 'Don\'t have an account?',
    'auth.have_account': 'Already have an account?',

    // Topics
    'topics.title': 'Topics',
    'topics.create_new': 'Create Topic',
    'topics.search': 'Search...',
    'topics.views': 'Views',
    'topics.replies': 'Replies',
    'topics.last_reply': 'Last Reply',
    'topics.by': 'by',
    'topics.no_topics': 'No topics found',

    // Comments
    'comments.reply': 'Reply',
    'comments.edit': 'Edit',
    'comments.delete': 'Delete',
    'comments.report': 'Report',
    'comments.no_comments': 'No comments',

    // Translation
    'translation.request': 'Request Translation',
    'translation.pending': 'Pending',
    'translation.in_progress': 'In Progress',
    'translation.completed': 'Completed',

    // General
    'general.loading': 'Loading...',
    'general.error': 'Error',
    'general.success': 'Success',
    'general.cancel': 'Cancel',
    'general.save': 'Save',
    'general.edit': 'Edit',
    'general.delete': 'Delete',
    'general.confirm': 'Confirm',
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.forums': 'Fóruns',
    'nav.topics': 'Tópicos',
    'nav.topics_create': 'Publicar Tópico',
    'nav.topics_my': 'Meus Tópicos',
    'nav.translators': 'Tradutores',
    'nav.admin': 'Administração',
    'nav.profile': 'Perfil',
    'nav.login': 'Entrar',
    'nav.register': 'Registrar',
    'nav.logout': 'Sair',
    'home.title': 'Fórum VIH Multilíngue',
    'home.subtitle': 'Espaço de troca e apoio para a comunidade',
    'home.description': 'Junte-se à nossa comunidade para compartilhar experiências, conselhos e apoio mútuo.',
    'home.featured_topics': 'Tópicos em Destaque',
    'home.recent_topics': 'Tópicos Recentes',
    'home.join_community': 'Junte-se à Comunidade',

    // Authentication
    'auth.login_title': 'Entrar',
    'auth.register_title': 'Registrar',
    'auth.password': 'Senha',
    'auth.username': 'Nome de usuário',
    'auth.first_name': 'Primeiro Nome',
    'auth.last_name': 'Sobrenome',
    'auth.nationality': 'Nacionalidade',
    'auth.login_button': 'Entrar',
    'auth.register_button': 'Registrar',
    'auth.no_account': 'Não tem uma conta?',
    'auth.have_account': 'Já tem uma conta?',

    // Topics
    'topics.title': 'Tópicos',
    'topics.create_new': 'Criar Tópico',
    'topics.search': 'Pesquisar...',
    'topics.views': 'Visualizações',
    'topics.replies': 'Respostas',
    'topics.last_reply': 'Última Resposta',
    'topics.by': 'por',
    'topics.no_topics': 'Nenhum tópico encontrado',

    // Comments
    'comments.reply': 'Responder',
    'comments.edit': 'Editar',
    'comments.delete': 'Excluir',
    'comments.report': 'Reportar',
    'comments.no_comments': 'Sem comentários',

    // Translation
    'translation.request': 'Solicitar Tradução',
    'translation.pending': 'Pendente',
    'translation.in_progress': 'Em Andamento',
    'translation.completed': 'Concluída',

    // General
    'general.loading': 'Carregando...',
    'general.error': 'Erro',
    'general.success': 'Sucesso',
    'general.cancel': 'Cancelar',
    'general.save': 'Salvar',
    'general.edit': 'Editar',
    'general.delete': 'Excluir',
    'general.confirm': 'Confirmar',
    'general.close': 'Fechar',
  },
};

// Provider du contexte des langues
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('fr');

  // Charger la langue depuis le localStorage au démarrage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Sauvegarder la langue dans le localStorage
  const changeLanguage = (language) => {
    if (translations[language]) {
      setCurrentLanguage(language);
      localStorage.setItem('preferred-language', language);
    }
  };

  // Fonction de traduction
  const t = (key) => {
    return translations[currentLanguage]?.[key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: Object.keys(translations),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte des langues
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
