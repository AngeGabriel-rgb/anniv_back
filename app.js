import express from 'express';
import participantRoutes from './routes/participantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import anniversaireRoutes from './routes/anniversaireRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import bcryptjs from 'bcryptjs';
import pkg from '@prisma/client';
import nodemailer from 'nodemailer';

const { PrismaClient } = pkg;

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Configuration de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fonction pour envoyer un email
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé à ${to}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
};

app.get('/', async (req, res) => {
  res.send('Happy Birthday');
});

// Configuration du middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/participants', participantRoutes);
app.use('/admin', adminRoutes);
app.use('/anniversaires', anniversaireRoutes);
app.use('/auths', authRoutes);

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

// Création d'un super administrateur
async function createSuperAdmin() {
  try {
    const superAdmin = await prisma.user.findUnique({
      where: { email: process.env.SUPER_ADMIN_EMAIL },
    });

    if (!superAdmin) {
      const hashedPassword = await bcryptjs.hash(process.env.SUPER_ADMIN_PASSWORD, 10);

      await prisma.user.create({
        data: {
          nom: process.env.SUPER_ADMIN_NOM,
          email: process.env.SUPER_ADMIN_EMAIL,
          password: hashedPassword,
          role: 'USER',
        },
      });
      console.log('Super administrateur créé avec succès');
    } else {
      console.log('Super administrateur existe déjà');
    }
  } catch (error) {
    console.error('Erreur lors de la création du super administrateur:', error);
  }
}

// Appelez la fonction pour créer le super administrateur
createSuperAdmin();

// Démarrer le serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});