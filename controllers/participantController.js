import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

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

// Récupérer tous les participants
export const getAllParticipants = async (req, res) => {
  try {
    const participants = await prisma.participant.findMany({
      include: {
        anniversaires: true, // Inclut les anniversaires si nécessaire
      },
    });
    res.json(participants);
  } catch (error) {
    console.error('Erreur lors de la récupération des participants:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des participants' });
  }
};

// Créer un participant
export const createParticipant = async (req, res) => {
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
        est_confirme: true, // Administrateur crée directement un participant confirmé
      },
    });
    
    // Envoyer l'email avec le code unique
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Votre code unique',
      html: `
        <h2>Votre code unique</h2>
        <p>Bonjour ${prenom} ${nom},</p>
        <p>Un compte a été créé pour vous sur notre plateforme de gestion des participants.</p>
        <p>Voici votre code unique pour accéder à notre plateforme :</p>
        <p style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">${code_unique}</p>
        <p>Conservez ce code précieusement, il vous sera demandé lors de la connexion.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, veuillez nous contacter immédiatement.</p>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(201).json(participant);
  } catch (error) {
    console.error('Erreur lors de la création du participant:', error);
    res.status(500).json({ message: 'Erreur lors de la création du participant' });
  }
};

// Récupérer un participant par ID
export const getParticipantById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const participant = await prisma.participant.findUnique({
      where: { id: Number(id) },
      include: {
        anniversaires: true, // Inclut les anniversaires si nécessaire
      },
    });
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant non trouvé' });
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Erreur lors de la récupération du participant:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du participant' });
  }
};

// Mettre à jour un participant
export const updateParticipant = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email } = req.body;
  
  try {
    // Vérifier si le participant existe
    const existingParticipant = await prisma.participant.findUnique({
      where: { id: Number(id) },
    });
    
    if (!existingParticipant) {
      return res.status(404).json({ message: 'Participant non trouvé' });
    }
    
    // Vérifier si l'email est déjà utilisé par un autre participant
    if (email !== existingParticipant.email) {
      const emailExists = await prisma.participant.findUnique({
        where: { email },
      });
      
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre participant' });
      }
    }
    
    // Mettre à jour le participant
    const participant = await prisma.participant.update({
      where: { id: Number(id) },
      data: { nom, prenom, email },
    });
    
    res.json(participant);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du participant:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du participant' });
  }
};

// Supprimer un participant
export const deleteParticipant = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Vérifier si le participant existe
    const existingParticipant = await prisma.participant.findUnique({
      where: { id: Number(id) },
    });
    
    if (!existingParticipant) {
      return res.status(404).json({ message: 'Participant non trouvé' });
    }
    
    // Supprimer le participant
    await prisma.participant.delete({
      where: { id: Number(id) },
    });
    
    res.json({ message: 'Participant supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du participant:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du participant' });
  }
};

// Régénérer et envoyer un nouveau code unique
export const regenerateUniqueCode = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Vérifier si le participant existe
    const existingParticipant = await prisma.participant.findUnique({
      where: { id: Number(id) },
    });
    
    if (!existingParticipant) {
      return res.status(404).json({ message: 'Participant non trouvé' });
    }
    
    // Générer un nouveau code unique
    const code_unique = generateUniqueCode();
    
    // Mettre à jour le participant avec le nouveau code
    const participant = await prisma.participant.update({
      where: { id: Number(id) },
      data: { code_unique },
    });
    
    // Envoyer l'email avec le nouveau code unique
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: participant.email,
      subject: 'Votre nouveau code unique',
      html: `
        <h2>Votre nouveau code unique</h2>
        <p>Bonjour ${participant.prenom} ${participant.nom},</p>
        <p>Voici votre nouveau code unique pour accéder à notre plateforme :</p>
        <p style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">${code_unique}</p>
        <p>Conservez ce code précieusement, il vous sera demandé lors de la connexion.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, veuillez nous contacter immédiatement.</p>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Nouveau code unique généré et envoyé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la régénération du code unique:', error);
    res.status(500).json({ message: 'Erreur lors de la régénération du code unique' });
  }
};