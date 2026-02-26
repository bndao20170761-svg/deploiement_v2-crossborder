const MICROSERVICES_CONFIG = {
  FORUM: {
    url: process.env.REACT_APP_FORUM_URL || 'http://localhost:3000',
    name: 'Forum PVVIH',
    port: 3000,
    description: 'Plateforme de discussion et de gestion des sujets'
  },
  FRONTEND_2: {
    url: process.env.REACT_APP_FRONTEND2_URL || 'http://localhost:3002',
    name: 'Frontend 2',
    port: 3002,
    description: 'Deuxième microservice frontend'
  },
  BACKEND: {
    url: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    name: 'API Backend',
    port: 8080,
    description: 'API backend pour les données'
  }
};

// Fonction utilitaire pour naviguer vers un microservice
export const navigateToMicroservice = (serviceName) => {
  const service = MICROSERVICES_CONFIG[serviceName.toUpperCase()];
  if (service) {
    console.log(`Navigation vers ${service.name} (${service.url})`);
    window.location.href = service.url;
  } else {
    console.error(`Microservice ${serviceName} non trouvé`);
  }
};

// Fonction pour ouvrir dans un nouvel onglet
export const openMicroserviceInNewTab = (serviceName) => {
  const service = MICROSERVICES_CONFIG[serviceName.toUpperCase()];
  if (service) {
    console.log(`Ouverture de ${service.name} dans un nouvel onglet (${service.url})`);
    window.open(service.url, '_blank');
  } else {
    console.error(`Microservice ${serviceName} non trouvé`);
  }
};

export default MICROSERVICES_CONFIG;





















