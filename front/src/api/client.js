import axios from 'axios';

// Création d'une instance Axios configurée pour l'API backend
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // URL du serveur Express
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Autorise l'inclusion des cookies dans les requêtes cross-origin
});

// Intercepteur de requête pour l'injection automatique du token JWT d'accès
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse pour la gestion de l'expiration du token d'accès (erreur 401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Vérification du code 401 et de l'absence de tentative de rafraîchissement préalable (prévention des boucles infinies)
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true; // Marquage de la requête indiquant qu'une tentative a été effectuée

      try {
        // Requête de renouvellement du token (le cookie de rafraîchissement est inclus automatiquement)
        const res = await axios.post('http://localhost:3000/api/auth/refresh', {}, { withCredentials: true });
        
        // Stockage du nouveau token et mise à jour de l'en-tête de la requête initiale
        localStorage.setItem('token', res.data.token);
        originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
        
        // Réexécution de la requête initiale avec le nouveau token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // En cas d'échec du rafraîchissement, suppression des données locales
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Redirection vers la page d'authentification
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
