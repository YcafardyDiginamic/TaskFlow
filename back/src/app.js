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
  origin: 'http://localhost:5173', // L'URL exacte de ton frontend
  credentials: true // Indispensable pour autoriser l'échange de cookies
}));
app.use(morgan('dev')); // Affiche chaque requête HTTP dans le terminal (ex: POST /api/users 400)

// Documentation Swagger (accessible sur http://localhost:3000/api-docs)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes publiques (l'inscription /users et la connexion /auth sont accessibles à tous)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Routes protégées (nécessitent un token JWT valide)
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/categories', authMiddleware, categoryRoutes);

module.exports = app;