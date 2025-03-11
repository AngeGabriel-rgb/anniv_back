import express from 'express';
import {
  getAllAnniversaires,
  getAnniversaireById,
  createAnniversaire,
  updateAnniversaire,
  deleteAnniversaire,
  addParticipantToAnniversaire,
  removeParticipantFromAnniversaire,
} from '../controllers/anniversaireController.js';

const router = express.Router();

// Routes pour la gestion des anniversaires
router.get('/', getAllAnniversaires);
router.get('/:id', getAnniversaireById);
router.post('/', createAnniversaire);
router.put('/:id', updateAnniversaire);
router.delete('/:id', deleteAnniversaire);
router.post('/:id/participants', addParticipantToAnniversaire);
router.delete('/:id/participants/:participantId', removeParticipantFromAnniversaire);

export default router;