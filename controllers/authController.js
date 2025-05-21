import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
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
// logique pour inscrire un administrateur
export const adminregister = async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    // Vérifier si l'email est déjà utilisé
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const admin = await prisma.admin.create({
      data: {
        nom,
        prenom,
        email,
        password: bcryptjs.hashSync(password, 8),
        role: "ADMIN", // Ou la valeur appropriée pour le rôle
      },
    });

    // Générer un token JWT avec isAdmin
    const token = jwt.sign(
      { adminId: admin.id, isAdmin: true }, // Ajoutez isAdmin ici
      process.env.JWT_SECRET,
      { expiresIn: '72h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('Erreur lors de l\'inscription de l\'administrateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
export const adminlogin = async (req, res) => {
  const { email, password } = req.body;
  console.log('Tentative de connexion:', email);

  if (!email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !bcryptjs.compareSync(password, admin.password)) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Debug: Affiche le secret pour vérification
    console.log('JWT Secret utilisé:', process.env.JWT_SECRET || 'anniversaire');

    // Correction ici ↓
    const token = jwt.sign(
      { adminId: admin.id, isAdmin: true },
      process.env.JWT_SECRET || 'anniversaire', // Utilise soit la variable d'environnement, soit une valeur par défaut
      { expiresIn: '72h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Erreur lors de la connexion de l\'administrateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Fonction pour connecter un utilisateur
export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  // Vérifier si tous les champs sont fournis
  if (!email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = bcryptjs.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '72h' },
    );

    // Retourner le token
    res.status(200).json({ token });
  } catch (error) {
    console.error('Erreur lors de la connexion de l\'utilisateur:', error);
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
        password: bcryptjs.hashSync(password, 8),
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

    if (!participant || !bcryptjs.compareSync(password, participant.password)) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: participant.id },
      process.env.jwt_SECRET,
      { expiresIn: '48h' },
    );

    res.json({ token });
  } catch (error) {
    console.error('Erreur lors de la connexion du participant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
// confirmation du mail
export const confirmEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.jwt_SECRET);
    const { adminId, userId } = decoded;

    if (adminId) {
      await prisma.admin.update({
        where: { id: adminId },
        data: { emailConfirmed: true },
      });
      res.status(200).json({ message: 'Email administrateur confirmé' });
    } else if (userId) {
      await prisma.participant.update({
        where: { id: userId },
        data: { emailConfirmed: true },
      });
      res.status(200).json({ message: 'Email participant confirmé' });
    } else {
      res.status(400).json({ message: 'Token invalide' });
    }
  } catch (error) {
    console.error('Erreur lors de la confirmation de l\'email:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};