import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

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

// Connexion administrateur
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }
  
  try {
    const admin = await prisma.administrateur.findUnique({ where: { email } });
    
    if (!admin) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '72h' });
    
    res.status(200).json({ 
      token,
      admin: {
        id: admin.id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};
// Inscription participant
export const participantRegister = async (req, res) => {
  const { nom, prenom, email } = req.body;
  
  if (!nom || !prenom || !email) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }
  
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
      message: 'Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.',
      participantId: participant.id
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

// Confirmation de l'email
export const confirmEmail = async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({ message: 'Token requis' });
  }
  
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
        <p>Conservez ce code précieusement, il vous sera demandé lors de la connexion.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, veuillez nous contacter immédiatement.</p>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'Email confirmé avec succès ! Votre code unique a été envoyé à votre adresse email.' });
  } catch (error) {
    console.error('Erreur lors de la confirmation de l\'email:', error);
    res.status(500).json({ message: 'Erreur lors de la confirmation de l\'email' });
  }
};

// Connexion participant
export const participantLogin = async (req, res) => {
  const { email, code_unique } = req.body;
  
  if (!email || !code_unique) {
    return res.status(400).json({ message: 'Email et code unique requis' });
  }
  
  try {
    const participant = await prisma.participant.findUnique({ 
      where: { email } 
    });
    
    if (!participant) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    if (!participant.est_confirme) {
      return res.status(401).json({ message: 'Veuillez confirmer votre email avant de vous connecter' });
    }
    
    if (participant.code_unique !== code_unique) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    const token = jwt.sign({ id: participant.id, role: 'participant' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.status(200).json({ 
      token,
      participant: {
        id: participant.id,
        nom: participant.nom,
        prenom: participant.prenom,
        email: participant.email
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};
// inscription administrateur
export const adminregister = async (req, res) => {
  const { nom, prenom, email, password } = req.body;
  
  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }
  
  try {
    // Vérifier si l'email existe déjà
    const existingAdmin = await prisma.administrateur.findUnique({
      where: { email },
    });
    
    if (existingAdmin) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Crypter le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
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
      message: 'Inscription réussie !',
      admin: { 
        id: admin.id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};