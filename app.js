import express from 'express';
import participantRoutes from './routes/participantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import anniversaireRoutes from './routes/anniversaireRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

dotenv.config();

const app = express();

app.get('/', async (req, res) => {
  res.send('happy birthday');
});

// Configuration du middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/participants', participantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/anniversaires', anniversaireRoutes);

// erreur du middleware
app.use((req, res, next) => {
  const error = new Error('Page non trouvée');
  error.status = 404;
  next(error);
});

async function createSuperAdmin() {
  const saltRounds = 10;
  const plainPassword = "angelito2302"; // Remplacez par le mot de passe souhaité

  try {
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      const newUser = await prisma.user.create({
          data: {
              email: "gabrielange433@gmail.com",
              password: hashedPassword,
              role: "premieradmin",
          },
      });

      console.log(' Administrateur créé:', newUser);
  } catch (error) {
      console.error('Erreur lors de la création de l\'administrateur:', error);
  } finally {
      await prisma.$disconnect(); // Déconnecter le client Prisma
  }
}

// Appelez la fonction pour créer le super administrateur
createSuperAdmin();

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});