import express from 'express';
import {
  getAllParticipants,
  createParticipant,
  getParticipantById,
  deleteParticipant,
  updateParticipant,
  regenerateUniqueCode
} from '../controllers/participantController.js';

const router = express.Router();

// Route pour récupérer tous les participants
router.get('/', getAllParticipants);

// Route pour créer un participant
router.post('/', createParticipant);

// Route pour récupérer un participant par ID
router.get('/:id', getParticipantById);

// Route pour supprimer un participant
router.delete('/:id', deleteParticipant);

// Route pour mettre à jour un participant
router.put('/:id', updateParticipant);

// Route pour régénérer et envoyer un nouveau code unique
router.post('/:id/regenerate-code', regenerateUniqueCode);

export default router;