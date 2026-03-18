require('dotenv').config(); // Permet de lire les variables d'environnement (ex: MONGO_URI, PORT)
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

// 1. Connexion à la base de données MongoDB
connectDB();

// 2. Démarrage du serveur Express
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Serveur en écoute sur le port ${PORT}`);
  console.log(`📚 Documentation Swagger : http://localhost:${PORT}/api-docs`);
  console.log(`=========================================`);
});