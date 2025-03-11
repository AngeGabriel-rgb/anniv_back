import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const existingAnniversaire = await prisma.anniversaire.findUnique({
      where: { id: Number(id) },
    });

    if (!existingAnniversaire) {
      return res.status(404).json({ message: 'Anniversaire non trouvé' });
    }

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
    const existingAnniversaire = await prisma.anniversaire.findUnique({
      where: { id: Number(id) },
    });

    if (!existingAnniversaire) {
      return res.status(404).json({ message: 'Anniversaire non trouvé' });
    }

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
    const existingAnniversaire = await prisma.anniversaire.findUnique({
      where: { id: Number(id) },
    });

    if (!existingAnniversaire) {
      return res.status(404).json({ message: 'Anniversaire non trouvé' });
    }

    const existingParticipant = await prisma.participant.findUnique({
      where: { id: Number(participantId) },
    });

    if (!existingParticipant) {
      return res.status(404).json({ message: 'Participant non trouvé' });
    }

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
    const existingAnniversaire = await prisma.anniversaire.findUnique({
      where: { id: Number(id) },
    });

    if (!existingAnniversaire) {
      return res.status(404).json({ message: 'Anniversaire non trouvé' });
    }

    const existingParticipant = await prisma.participant.findUnique({
      where: { id: Number(participantId) },
    });

    if (!existingParticipant) {
      return res.status(404).json({ message: 'Participant non trouvé' });
    }

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