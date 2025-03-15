import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendEmail, emailTemplates } from '../utils/emailService.js';
const prisma = new PrismaClient();

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

// ===== GESTION DES PARTICIPANTS =====

// Récupérer tous les participants
export const getAllParticipants = async (req, res) => {
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

// Récupérer un participant par ID
export const getParticipantById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const participant = await prisma.participant.findUnique({
      where: { id: Number(id) },
      include: {
        anniversaires: true,
      },
    });
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant non trouvé' });
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Erreur lors de la récupération du participant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un participant
export const createParticipant = async (req, res) => {
  const { nom, prenom, email } = req.body;
  
  if (!nom || !email) {
    return res.status(400).json({ message: 'Nom et email requis' });
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
        prenom: prenom || '',
        email,
        code_unique,
        est_confirme: true, // L'administrateur crée un compte déjà confirmé
      },
    });
    
    // Envoyer l'email avec le code unique
    await sendEmail(
      email,
      'Votre code unique',
      emailTemplates.uniqueCodeEmail(nom, prenom || '', code_unique)
    );
    
    res.status(201).json(participant);
  } catch (error) {
    console.error('Erreur lors de la création du participant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
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
    if (email && email !== existingParticipant.email) {
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
      data: {
        nom: nom || existingParticipant.nom,
        prenom: prenom !== undefined ? prenom : existingParticipant.prenom,
        email: email || existingParticipant.email,
      },
    });
    
    res.json(participant);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du participant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
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
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Régénérer le code unique d'un participant
export const regenerateParticipantCode = async (req, res) => {
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
    await sendEmail(
      participant.email,
      'Votre nouveau code unique',
      emailTemplates.uniqueCodeEmail(participant.nom, participant.prenom, code_unique)
    );
    
    res.json({ message: 'Code unique régénéré et envoyé avec succès', code_unique });
  } catch (error) {
    console.error('Erreur lors de la régénération du code unique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== GESTION DES ANNIVERSAIRES =====

// Récupérer tous les anniversaires
export const getAllAnniversaires = async (req, res) => {
  try {
    const anniversaires = await prisma.anniversaire.findMany({
      include: {
        participants: true,
      },
    });
    
    res.json(anniversaires);
  } catch (error) {
    console.error('Erreur lors de la récupération des anniversaires:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer un anniversaire par ID
export const getAnniversaireById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const anniversaire = await prisma.anniversaire.findUnique({
      where: { id: Number(id) },
      include: {
        participants: true,
      },
    });
    
    if (!anniversaire) {
      return res.status(404).json({ message: 'Anniversaire non trouvé' });
    }
    
    res.json(anniversaire);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'anniversaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un anniversaire
export const createAnniversaire = async (req, res) => {
  const { titre, date, participantIds } = req.body;
  
  if (!titre || !date) {
    return res.status(400).json({ message: 'Titre et date requis' });
  }
  
  try {
    // Créer l'anniversaire
    const anniversaire = await prisma.anniversaire.create({
      data: {
        titre,
        date: new Date(date),
        participants: participantIds ? {
          connect: participantIds.map(id => ({ id: Number(id) })),
        } : undefined,
      },
      include: {
        participants: true,
      },
    });
    
    res.status(201).json(anniversaire);
  } catch (error) {
    console.error('Erreur lors de la création de l\'anniversaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un anniversaire
export const updateAnniversaire = async (req, res) => {
  const { id } = req.params;
  const { titre, date, participantIds } = req.body;
  
  try {
    // Vérifier si l'anniversaire existe
    const existingAnniversaire = await prisma.anniversaire.findUnique({
      where: { id: Number(id) },
    });
    
    if (!existingAnniversaire) {
      return res.status(404).json({ message: 'Anniversaire non trouvé' });
    }
    
    // Mettre à jour l'anniversaire
    const anniversaire = await prisma.anniversaire.update({
      where: { id: Number(id) },
      data: {
        titre: titre || existingAnniversaire.titre,
        date: date ? new Date(date) : existingAnniversaire.date,
        participants: participantIds ? {
          set: [], // Supprimer toutes les relations existantes
          connect: participantIds.map(id => ({ id: Number(id) })), // Ajouter les nouvelles relations
        } : undefined,
      },
      include: {
        participants: true,
      },
    });
    
    res.json(anniversaire);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'anniversaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un anniversaire
export const deleteAnniversaire = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Vérifier si l'anniversaire existe
    const existingAnniversaire = await prisma.anniversaire.findUnique({
      where: { id: Number(id) },
    });
    
    if (!existingAnniversaire) {
      return res.status(404).json({ message: 'Anniversaire non trouvé' });
    }
    
    // Supprimer l'anniversaire
    await prisma.anniversaire.delete({
      where: { id: Number(id) },
    });
    
    res.json({ message: 'Anniversaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'anniversaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Ajouter un participant à un anniversaire
export const addParticipantToAnniversaire = async (req, res) => {
  const { id } = req.params;
  const { participantId } = req.body;
  
  if (!participantId) {
    return res.status(400).json({ message: 'ID du participant requis' });
  }
  
  try {
    // Vérifier si l'anniversaire existe
    const existingAnniversaire = await prisma.anniversaire.findUnique({
      where: { id: Number(id) },
    });
    
    if (!existingAnniversaire) {
      return res.status(404).json({ message: 'Anniversaire non trouvé' });
    }
    
    // Vérifier si le participant existe
    const existingParticipant = await prisma.participant.findUnique({
      where: { id: Number(participantId) },
    });
    
    if (!existingParticipant) {
      return res.status(404).json({ message: 'Participant non trouvé' });
    }
    
    // Ajouter le participant à l'anniversaire
    const anniversaire = await prisma.anniversaire.update({
      where: { id: Number(id) },
      data: {
        participants: {
          connect: { id: Number(participantId) },
        },
      },
      include: {
        participants: true,
      },
    });
    
    res.json(anniversaire);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du participant à l\'anniversaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un participant d'un anniversaire
export const removeParticipantFromAnniversaire = async (req, res) => {
  const { id, participantId } = req.params;
  
  try {
    // Vérifier si l'anniversaire existe
    const existingAnniversaire = await prisma.anniversaire.findUnique({
      where: { id: Number(id) },
    });
    
    if (!existingAnniversaire) {
      return res.status(404).json({ message: 'Anniversaire non trouvé' });
    }
    
    // Vérifier si le participant existe
    const existingParticipant = await prisma.participant.findUnique({
      where: { id: Number(participantId) },
    });
    
    if (!existingParticipant) {
      return res.status(404).json({ message: 'Participant non trouvé' });
    }
    
    // Supprimer le participant de l'anniversaire
    const anniversaire = await prisma.anniversaire.update({
      where: { id: Number(id) },
      data: {
        participants: {
          disconnect: { id: Number(participantId) },
        },
      },
      include: {
        participants: true,
      },
    });
    
    res.json(anniversaire);
  } catch (error) {
    console.error('Erreur lors de la suppression du participant de l\'anniversaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== GESTION DES ADMINISTRATEURS =====

// Récupérer tous les administrateurs
export const getAllAdministrateurs = async (req, res) => {
  try {
    const administrateurs = await prisma.administrateur.findMany({
      select: {
        id: true,
        nom: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    res.json(administrateurs);
  } catch (error) {
    console.error('Erreur lors de la récupération des administrateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer un administrateur par ID
export const getAdministrateurById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const administrateur = await prisma.administrateur.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nom: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!administrateur) {
      return res.status(404).json({ message: 'Administrateur non trouvé' });
    }
    
    res.json(administrateur);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'administrateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un administrateur
export const createAdministrateur = async (req, res) => {
  const { nom, email, password } = req.body;
  
  if (!nom || !email || !password) {
    return res.status(400).json({ message: 'Nom, email et mot de passe requis' });
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
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'administrateur
    const administrateur = await prisma.administrateur.create({
      data: {
        nom,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        nom: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    res.status(201).json(administrateur)
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un administrateur
export const updateAdministrateur = async (req, res) => {
  const { id } = req.params;
  const { nom, email, password } = req.body;
  
  try {
    // Vérifier si l'administrateur existe
    const existingAdmin = await prisma.administrateur.findUnique({
      where: { id: Number(id) },
    });
    
    if (!existingAdmin) {
      return res.status(404).json({ message: 'Administrateur non trouvé' });
    }
    
    // Vérifier si l'email est déjà utilisé par un autre administrateur
    if (email && email !== existingAdmin.email) {
      const emailExists = await prisma.administrateur.findUnique({
        where: { email },
      });
      
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre administrateur' });
      }
    }
    
    // Préparer les données à mettre à jour
    const updateData = {
      nom: nom || existingAdmin.nom,
      email: email || existingAdmin.email,
    };
    
    // Si un nouveau mot de passe est fourni, le hasher
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // Mettre à jour l'administrateur
    const administrateur = await prisma.administrateur.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        nom: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    res.json(administrateur);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'administrateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un administrateur
export const deleteAdministrateur = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Vérifier si l'administrateur existe
    const existingAdmin = await prisma.administrateur.findUnique({
      where: { id: Number(id) },
    });
    
    if (!existingAdmin) {
      return res.status(404).json({ message: 'Administrateur non trouvé' });
    }
    
    // Empêcher la suppression du dernier administrateur
    const adminCount = await prisma.administrateur.count();
    if (adminCount <= 1) {
      return res.status(400).json({ message: 'Impossible de supprimer le dernier administrateur' });
    }
    
    // Supprimer l'administrateur
    await prisma.administrateur.delete({
      where: { id: Number(id) },
    });
    
    res.json({ message: 'Administrateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'administrateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};