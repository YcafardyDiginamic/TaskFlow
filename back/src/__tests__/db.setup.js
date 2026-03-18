const mongoose = require('mongoose');

/**
 * Initialise la connexion Mongoose pour les tests
 */
const connect = async () => {
  try {
    // Utilisation d'une base de données dédiée aux tests pour éviter l'altération des données de développement lors du dropDatabase
    // Intégration de JEST_WORKER_ID pour garantir l'isolation des bases de données lors de l'exécution parallèle des tests
    const uri = process.env.MONGO_URI_TEST || `mongodb://127.0.0.1:27017/taskflow_test_${process.env.JEST_WORKER_ID || '1'}`;
    await mongoose.connect(uri);
  } catch (error) {
    console.error(' Impossible de se connecter à MongoDB pour les tests :', error.message);
    process.exit(1);
  }
};

/**
 * Vide la base de données de test et ferme la connexion Mongoose
 */
const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
};

/**
 * Supprime tous les documents de toutes les collections sans supprimer les index
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

module.exports = {
  connect,
  closeDatabase,
  clearDatabase
};