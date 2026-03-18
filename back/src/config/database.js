const mongoose = require('mongoose');
const connectDB = async () => {
try {
const conn = await mongoose.connect(process.env.MONGO_URI, {
// Ces options sont activées par défaut depuis Mongoose 6
// On les laisse ici pour la lisibilité
});
console.log(` MongoDB connecté : ${conn.connection.host}`);

// Écouter les événements de connexion
mongoose.connection.on('error', (err) => {
console.error(' Erreur MongoDB :', err.message);
});
mongoose.connection.on('disconnected', () => {
console.warn('⚠️ MongoDB déconnecté.');
});
} catch (error) {
console.error(' Impossible de se connecter à MongoDB :', error.message);
process.exit(1);
}
};
module.exports = connectDB;