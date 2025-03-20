import express from 'express';
import participantRoutes from './routes/participantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import anniversaireRoutes from './routes/anniversaireRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import bcryptjs from 'bcryptjs';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.get('/', async (req, res) => {
  res.send('happy birthday');
});

// Configuration du middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/participants', participantRoutes);
app.use('/admin', adminRoutes);
app.use('/anniversaires', anniversaireRoutes);
app.use('/auths', authRoutes);

// Middleware pour les erreurs
app.use((req, res, next) => {
  const error = new Error('Page non trouvée');
  error.status = 404;
  next(error);
});

//creation d'un superadmin
async function createSuperAdmin() {
  const superAdmin = await prisma.user.findUnique({
    where: { email: process.env.SUPER_ADMIN_EMAIL },
  });

  if (!superAdmin) {
    // Hacher le mot de passe avant de le stocker
    const hashedPassword = await bcryptjs.hash(process.env.SUPER_ADMIN_PASSWORD, 10); // Utilisez 10 pour le facteur de coût

    await prisma.user.create({
      data: {
        nom: process.env.SUPER_ADMIN_NOM,
        email: process.env.SUPER_ADMIN_EMAIL,
        password: hashedPassword, // Utiliser le mot de passe haché
        role: 'SUPER_ADMIN',
      },
    });
    console.log('Super administrateur créé avec succès');
  } else {
    console.log('Super administrateur existe déjà');
  }
}

// Appelez la fonction pour créer le super administrateur
createSuperAdmin().catch((error) => {
  console.error('Erreur lors de la création du super administrateur:', error);
});

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});
