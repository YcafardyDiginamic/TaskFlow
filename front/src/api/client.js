import axios from 'axios';

// Création d'une instance Axios pointant vers notre backend
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // L'URL serveur Express
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Autorise l'envoi et la réception de cookies
});

// Intercepteur pour injecter automatiquement le token JWT s'il existe
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

// Intercepteur pour gérer l'expiration du Access Token (401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si on a un 401 et qu'on a pas déjà essayé de refresh (évite les boucles infinies)
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true; // Marque la requête comme déjà tentée

      try {
        // Appel en arrière-plan pour obtenir un nouveau token (le cookie est envoyé automatiquement)
        const res = await axios.post('http://localhost:3000/api/auth/refresh', {}, { withCredentials: true });
        
        // Sauvegarde le nouveau token et met à jour le header de l'ancienne requête
        localStorage.setItem('token', res.data.token);
        originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
        
        // Relance la requête d'origine incognito
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si le Refresh Token est également expiré, déconnexion dure
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Redirige vers le login
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
