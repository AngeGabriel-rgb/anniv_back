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

/**
 * @swagger
 * /participants:
 *   get:
 *     summary: Obtenir tous les participants
 *     description: Récupère la liste de tous les participants
 *     responses:
 *       200:
 *         description: Liste des participants
 *       500:
 *         description: Erreur du serveur
 */
router.get('/', getAllParticipants);

/**
 * @swagger
 * /participants:
 *   post:
 *     summary: Créer un nouvel participant
 *     description: Permet de créer un nouvel utilisateur participant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               uniqueCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Participant créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur du serveur
 */
router.post('/', createParticipant);

/**
 * @swagger
 * /participants/{id}:
 *   get:
 *     summary: Obtenir un participant par ID
 *     description: Récupère les détails d'un participant spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du participant à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du participant
 *       404:
 *         description: Participant non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.get('/:id', getParticipantById);

/**
 * @swagger
 * /participants/{id}:
 *   delete:
 *     summary: Supprimer un participant
 *     description: Supprime un participant existant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du participant à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Participant supprimé avec succès
 *       404:
 *         description: Participant non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.delete('/:id', deleteParticipant);

/**
 * @swagger
 * /participants/{id}:
 *   put:
 *     summary: Mettre à jour un participant
 *     description: Met à jour les informations d'un participant existant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du participant à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Participant mis à jour avec succès
 *       404:
 *         description: Participant non trouvé
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur du serveur
 */
router.put('/:id', updateParticipant);

/**
 * @swagger
 * /participants/{id}/regenerate-code:
 *   post:
 *     summary: Régénérer un code unique pour un participant
 *     description: Génère et envoie un nouveau code unique à un participant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du participant
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Code unique régénéré et envoyé avec succès
 *       404:
 *         description: Participant non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.post('/:id/regenerate-code', regenerateUniqueCode);

export default router;