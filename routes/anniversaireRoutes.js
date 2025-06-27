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

/**
 * @swagger
 * /anniversaires:
 *   get:
 *     summary: Obtenir tous les anniversaires
 *     description: Récupère la liste de tous les anniversaires
 *     responses:
 *       200:
 *         description: Liste des anniversaires
 *       500:
 *         description: Erreur du serveur
 */
router.get('/', getAllAnniversaires);

/**
 * @swagger
 * /anniversaires/{id}:
 *   get:
 *     summary: Obtenir un anniversaire par ID
 *     description: Récupère les détails d'un anniversaire spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'anniversaire à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'anniversaire
 *       404:
 *         description: Anniversaire non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.get('/:id', getAnniversaireById);

/**
 * @swagger
 * /anniversaires:
 *   post:
 *     summary: Créer un nouvel anniversaire
 *     description: Permet de créer un nouvel anniversaire
 *     responses:
 *       201:
 *         description: Anniversaire créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur du serveur
 */
router.post('/', createAnniversaire);

/**
 * @swagger
 * /anniversaires/{id}:
 *   put:
 *     summary: Mettre à jour un anniversaire
 *     description: Met à jour les informations d'un anniversaire existant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'anniversaire à mettre à jour
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Anniversaire mis à jour avec succès
 *       404:
 *         description: Anniversaire non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.put('/:id', updateAnniversaire);

/**
 * @swagger
 * /anniversaires/{id}:
 *   delete:
 *     summary: Supprimer un anniversaire
 *     description: Supprime un anniversaire existant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'anniversaire à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Anniversaire supprimé avec succès
 *       404:
 *         description: Anniversaire non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.delete('/:id', deleteAnniversaire);

/**
 * @swagger
 * /anniversaires/{id}/participants:
 *   post:
 *     summary: Ajouter un participant à un anniversaire
 *     description: Ajoute un participant à un anniversaire existant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'anniversaire
 *         schema:
 *           type: string
 *       - in: body
 *         name: participant
 *         required: true
 *         description: Détails du participant à ajouter
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *     responses:
 *       201:
 *         description: Participant ajouté avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Anniversaire non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.post('/:id/participants', addParticipantToAnniversaire);

/**
 * @swagger
 * /anniversaires/{id}/participants/{participantId}:
 *   delete:
 *     summary: Supprimer un participant d'un anniversaire
 *     description: Supprime un participant d'un anniversaire existant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'anniversaire
 *         schema:
 *           type: string
 *       - in: path
 *         name: participantId
 *         required: true
 *         description: ID du participant à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Participant supprimé avec succès
 *       404:
 *         description: Anniversaire ou participant non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.delete('/:id/participants/:participantId', removeParticipantFromAnniversaire);

export default router;