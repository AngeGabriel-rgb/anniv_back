import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const prisma = new PrismaClient();

// nodemailer configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
};


// logique pour inscrire un administrateur
export const adminregister = async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ message: 'tous les champs sont requis' });
  }

  try {
    const adminregister = await prisma.admin.create({
      data: {
        nom,
        prenom,
        email,
        password: bcrypt.hashSync(password, 8),
      },
    });

    // creer un token
    const token = jwt.sign(
      { adminId: adminregister.id },
      process.env.TOKEN_SECRET,
      { expiresIn: '24h' },
    );

    res.status(201).json({ message: 'Administrateur inscrit', token });
  } catch (error) {
    console.error('Erreur lors de l\'inscription de l\'administrateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// connecter un administrateur
export const adminlogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'tous les champs sont requis' });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { adminId: admin.id },
      process.env.TOKEN_SECRET,
      { expiresIn: '24h' },
    );

    res.json({ token });
  } catch (error) {
    console.error('Erreur lors de la connexion de l\'administrateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// logique pour inscrire un participant   
export const participantRegister = async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ message: 'tous les champs sont requis' });
  }

  try {
    const participant = await prisma.participant.create({
      data: {
        nom,
        prenom,
        email,
        password: bcrypt.hashSync(password, 8),
      },
    });

    res.status(201).json({ message: 'Participant inscrit' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription du participant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// logique pour connecter un participant
export const participantLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'tous les champs sont requis' });
  }

  try {
    const participant = await prisma.participant.findUnique({
      where: { email },
    });

    if (!participant || !bcrypt.compareSync(password, participant.password)) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: participant.id },
      process.env.TOKEN_SECRET,
      { expiresIn: '48h' },
    );

    res.json({ token });
  } catch (error) {
    console.error('Erreur lors de la connexion du participant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
