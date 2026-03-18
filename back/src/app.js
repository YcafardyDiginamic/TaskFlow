const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Importation des routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Importation du middleware d'authentification
const authMiddleware = require('./middlewares/auth');

const app = express();

// Middlewares globaux
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // URL exacte du client frontend
  credentials: true // Requis pour autoriser l'échange de cookies cross-origin
}));
app.use(morgan('dev')); // Journalisation des requêtes HTTP dans la sortie standard (ex: POST /api/users 400)

// Exposition de la documentation Swagger (accessible via http://localhost:3000/api-docs)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes publiques (inscription sur /users et connexion sur /auth)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Routes protégées (requièrent un token JWT valide)
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/categories', authMiddleware, categoryRoutes);

module.exports = app;