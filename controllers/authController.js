import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Configuration de nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Hôte SMTP pour Gmail
  port: 587,              // Port pour TLS
  secure: false,          // true pour le port 465, false pour 587
  auth: {
    user: process.env.EMAIL_USER, // Votre adresse Gmail
    pass: process.env.EMAIL_PASS,  // Votre mot de passe ou mot de passe d'application
  },
});


// Fonction pour envoyer un email de confirmation
const sendConfirmationEmail = async (email, userId, isAdmin = false) => {
  const token = jwt.sign(
    { [isAdmin ? 'adminId' : 'userId']: userId },
    process.env.JWT_SECRET || 'anniversaire',
    { expiresIn: '24h' }
  );
  // Rediriger vers le tableau de bord du participant
  const confirmationLink = `${process.env.FRONTEND_URL}/particpant/dashboard/${token}`;
   
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirmation de votre email',
    html: `
      <h1>Merci pour votre inscription</h1>
      <p>Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
      <a href="${confirmationLink}">Confirmer mon email</a>
      <p>Ce lien expirera dans 24 heures.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};


// Logique pour inscrire un administrateur
export const adminregister = async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const admin = await prisma.admin.create({
      data: {
        nom,
        prenom,
        email,
        password: bcryptjs.hashSync(password, 8),
        role: "ADMIN",
        emailConfirmed: false,
      },
    });

    // Envoi de l'email de confirmation
    await sendConfirmationEmail(email, admin.id, true);

    const token = jwt.sign(
      { adminId: admin.id, isAdmin: true },
      process.env.JWT_SECRET || 'anniversaire',
      { expiresIn: '72h' }
    );

    res.status(201).json({ 
      message: 'Admin inscrit. Un email de confirmation a été envoyé.',
      token 
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription de l\'administrateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// logique pour connecter un admin 
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

    // Affiche le secret pour vérification
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


// Logique pour inscrire un participant
export const participantRegister = async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ message: 'Les champs sont incomplets' });
  }

  try {
    const existingParticipant = await prisma.participant.findUnique({ where: { email } });
    if (existingParticipant) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const participant = await prisma.participant.create({
      data: {
        nom,
        prenom,
        email,
        password: bcryptjs.hashSync(password, 8),
        est_confirme: false,
        emailConfirmed: false,
        code_unique: Math.random().toString(36).substring(2, 10).toUpperCase(),
      },
    });

    // Envoi de l'email de confirmation
    await sendConfirmationEmail(email, participant.id);

    res.status(201).json({ 
      message: 'Participant inscrit. Un email de confirmation a été envoyé.' 
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription du participant:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    res.status(500).json({ message: 'Erreur du serveur' });
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
      process.env.JWT_SECRET,
      { expiresIn: '48h' },
    );

    res.json({ token });
  } catch (error) {
    console.error('Erreur lors de la connexion du participant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Confirmation de l'email
export const confirmEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'anniversaire');
    const { adminId, userId } = decoded;

    if (adminId) {
      await prisma.admin.update({
        where: { id: adminId },
        data: { 
          emailConfirmed: true,
          est_confirme: true 
        },
      });
      return res.status(200).json({ message: 'Email administrateur confirmé' });
    } 
    
    if (userId) {
      await prisma.participant.update({
        where: { id: userId },
        data: { 
          emailConfirmed: true,
          est_confirme: true 
        },
      });
      return res.status(200).json({ message: 'Email participant confirmé' });
    }

    return res.status(400).json({ message: 'Token invalide' });
  } catch (error) {
    console.error('Erreur lors de la confirmation de l\'email:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Le lien de confirmation a expiré' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
