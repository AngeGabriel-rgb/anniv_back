import express from 'express';
import participantRoutes from './routes/participantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import anniversaireRoutes from './routes/anniversaireRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import pkg from '@prisma/client';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const { PrismaClient } = pkg;

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware pour analyser le corps des requêtes JSON
app.use(express.json());

// Configuration de Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API back',
      version: '1.0.0',
      description: 'Documentation de l\'API back',
    },
    servers: [
      {
        url: 'https://anniversaire-back.onrender.com', // URL de votre serveur
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Route pour la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/participants', participantRoutes);
app.use('/admin', adminRoutes);
app.use('/anniversaires', anniversaireRoutes);
app.use('/auths', authRoutes);

// Route de test
app.get('/', async (req, res) => {
  res.send('Happy Birthday');
});

// Middleware pour gérer les pages non trouvées
app.use((req, res, next) => {
  const error = new Error('Page non trouvée');
  error.status = 404;
  next(error);
});

// Gestionnaire global des erreurs
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    message: error.message || 'Une erreur est survenue',
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});