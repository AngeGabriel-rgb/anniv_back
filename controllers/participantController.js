import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Hôte SMTP pour Gmail
  port: 587,              // Port pour TLS
  secure: false,          // true pour le port 465, false pour 587
  auth: {
    user: process.env.EMAIL_USER, // Votre adresse Gmail
    pass: process.env.EMAIL_PASS,  // Votre mot de passe ou mot de passe d'application
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

// Récupérer tous les participants
const getAllParticipants = async (req, res) => {
  try {
    const participants = await prisma.participant.findMany({
      include: {
        anniversaires: true,
      },
    });
    res.json(participants);
  } catch (error) {
    console.error('Erreur lors de la récupération des participants:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un participant
const createParticipant = async (req, res) => {
  const { nom, prenom, email } = req.body;
  
  try {
    // Vérification email existant
    const existingParticipant = await prisma.participant.findUnique({ where: { email } });
    if (existingParticipant) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const code_unique = generateUniqueCode();
    const hashedPassword = await bcryptjs.hash(code_unique, 10);

    const participant = await prisma.participant.create({
      data: {
        nom,
        prenom,
        email,
        code_unique,
        est_confirme: true,
        password: hashedPassword
      },
    });

    // Envoi email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Vos identifiants',
      html: `
        <h2>Bienvenue ${prenom} ${nom}</h2>
        <p>Votre compte a été créé avec succès.</p>
        <p><strong>Code d'accès :</strong> ${code_unique}</p>
        <p><strong>Mot de passe temporaire :</strong> ${code_unique}</p>
        <p>Changez ce mot de passe après votre première connexion.</p>
      `,
    });

    const { password, ...participantData } = participant;
    res.status(201).json(participantData);

  } catch (error) {
    console.error('Erreur création participant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer un participant par ID
const getParticipantById = async (req, res) => {
  try {
    const participant = await prisma.participant.findUnique({
      where: { id: Number(req.params.id) },
      include: { anniversaires: true },
    });
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant non trouvé' });
    }
    
    const { password, ...participantData } = participant;
    res.json(participantData);
  } catch (error) {
    console.error('Erreur récupération participant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un participant
const updateParticipant = async (req, res) => {
  try {
    const participant = await prisma.participant.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    
    const { password, ...participantData } = participant;
    res.json(participantData);
  } catch (error) {
    console.error('Erreur mise à jour participant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un participant
const deleteParticipant = async (req, res) => {
  try {
    await prisma.participant.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: 'Participant supprimé' });
  } catch (error) {
    console.error('Erreur suppression participant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Régénérer un code unique
const regenerateUniqueCode = async (req, res) => {
  try {
    const code_unique = generateUniqueCode();
    const participant = await prisma.participant.update({
      where: { id: Number(req.params.id) },
      data: { code_unique },
    });

    await transporter.sendMail({
      to: participant.email,
      subject: 'Nouveau code d\'accès',
      html: `<p>Votre nouveau code: <strong>${code_unique}</strong></p>`
    });

    res.json({ message: 'Code régénéré' });
  } catch (error) {
    console.error('Erreur régénération code:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Export des fonctions
export {
  getAllParticipants,
  createParticipant,
  getParticipantById,
  updateParticipant,
  deleteParticipant,
  regenerateUniqueCode
};