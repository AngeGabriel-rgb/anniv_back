import express from 'express';
import participantRoutes from './routes/participantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import anniversaireRoutes from './routes/anniversaireRoutes.js'; // Assurez-vous de l'importer
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Configuration du middleware
app.use(cors());
app.use(express.json());

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Fonction pour générer un code unique
const generateUniqueCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 8;
  let code = '';

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
};

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

// Route pour l'inscription des participants
app.post('/api/participants/register', async (req, res) => {
  const { nom, prenom, email } = req.body;

  try {
    // Vérifier si l'email existe déjà
    const existingParticipant = await prisma.participant.findUnique({
      where: { email },
    });

    if (existingParticipant) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Générer un code unique
    const code_unique = generateUniqueCode();

    // Créer le participant
    const participant = await prisma.participant.create({
      data: {
        nom,
        prenom,
        email,
        code_unique,
      },
    });
    // routes pour l'inscription des administrateurs
    app.post('/api/admin/register', async (req, res) => {
      const { nom, prenom, email, password } = req.body;
      if (!nom || !prenom || !email || !password) {
        return res.status(400).json({ message: 'Veuillez remplir tous les champs' });
      }

      try {
        // Vérifier si l'email existe déjà
        const existingAdmin = await prisma.administrateur.findUnique({
          where: { email },
        });

        if (existingAdmin) {
          return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Créer l'administrateur
        const admin = await prisma.administrateur.create({
          data: {
            nom,
            prenom,
            email,
            password: hashedPassword,
          },
        });

        res.status(201).json({
          message: 'Administrateur enregistré avec succès !',
          adminId: admin.id,
        });
      } catch (error) {
        console.error('Erreur lors de l\'inscription de l\'administrateur:', error);
        res.status(500).json({ message: 'Erreur d\'enregistrement de l\'administrateur !' });
      }
    });


    // Générer un token de confirmation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expire après 24 heures

    await prisma.confirmationToken.create({
      data: {
        token,
        email,
        expiresAt,
      },
    });

    // Envoyer l'email de confirmation
    const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Confirmation de votre inscription',
      html: `
        <h2>Confirmation de votre inscription</h2>
        <p>Bonjour ${prenom} ${nom},</p>
        <p>Merci de vous être inscrit sur notre plateforme de gestion des participants.</p>
        <p>Veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse email :</p>
        <p>
          <a href="${confirmationUrl}">
            Confirmer mon adresse email
          </a>
        </p>
        <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'Participant enregistré ! Veuillez vérifier votre email pour confirmer votre compte.',
      participantId: participant.id,
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur d\'enregistrement du participant !' });
  }
});

// Route pour confirmer l'email
app.get('/api/participants/confirm-email', async (req, res) => {
  const { token } = req.query;

  try {
    // Vérifier si le token existe et n'est pas expiré
    const confirmationToken = await prisma.confirmationToken.findUnique({
      where: { token },
    });

    if (!confirmationToken) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    if (new Date() > confirmationToken.expiresAt) {
      await prisma.confirmationToken.delete({
        where: { token },
      });
      return res.status(400).json({ message: 'Token expiré' });
    }

    // Mettre à jour le statut du participant
    const participant = await prisma.participant.update({
      where: { email: confirmationToken.email },
      data: { est_confirme: true },
    });

    // Supprimer le token
    await prisma.confirmationToken.delete({
      where: { token },
    });

    // Envoyer l'email avec le code unique
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: participant.email,
      subject: 'Votre code unique',
      html: `
        <h2>Votre code unique</h2>
        <p>Bonjour ${participant.prenom} ${participant.nom},</p>
        <p>Voici votre code unique pour accéder à notre plateforme :</p>
        <p style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">${participant.code_unique}</p>
        <p>Conservez ce code précieusement, il vous sera demandé lors de certaines opérations.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, veuillez nous contacter immédiatement.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email confirmé avec succès ! Votre code unique a été envoyé à votre adresse email.' });
  } catch (error) {
    console.error('Erreur lors de la confirmation de l\'email:', error);
    res.status(500).json({ message: 'Erreur lors de la confirmation de l\'email' });
  }
});

// Route pour la connexion des administrateurs
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.administrateur.findUnique({ where: { email } });

    if (!admin) {
      return res.status(404).json({ message: 'Administrateur non trouvé !' });
    }

    const passwordIsValid = bcrypt.compareSync(password, admin.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({
      auth: true,
      token,
      admin: {
        id: admin.id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// Route pour la connexion des participants
app.post('/api/participants/login', async (req, res) => {
  const { email, code_unique } = req.body;

  try {
    const participant = await prisma.participant.findUnique({
      where: { email },
    });

    if (!participant) {
      return res.status(404).json({ message: 'Participant non trouvé !' });
    }

    if (!participant.est_confirme) {
      return res.status(401).json({ message: 'Veuillez confirmer votre email avant de vous connecter' });
    }

    if (participant.code_unique !== code_unique) {
      return res.status(401).json({ message: 'Code unique incorrect' });
    }

    const token = jwt.sign({ id: participant.id, role: 'participant' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({
      auth: true,
      token,
      participant: {
        id: participant.id,
        nom: participant.nom,
        prenom: participant.prenom,
        email: participant.email,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// Middleware pour vérifier le token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(403).json({ message: 'Token requis !' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré !' });
  }
};

// Vérifier les routes protégées pour les administrateurs
app.use('/api/admin', verifyToken, adminRoutes);

// Middleware pour vérifier si l'utilisateur est un administrateur
const isAdmin = (req, res, next) => {
  if (!req.userRole || req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé. Vous devez être administrateur.' });
  }
  next();
};

// Routes protégées nécessitant une authentification
app.use('/api/participants', verifyToken, participantRoutes);
app.use('/api/anniversaires', verifyToken, anniversaireRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});

