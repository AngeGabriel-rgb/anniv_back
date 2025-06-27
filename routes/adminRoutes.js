import express from 'express';
import {
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Créer un nouvel administrateur
 *     description: Permet de créer un administrateur sans authentification
 *     responses:
 *       201:
 *         description: Administrateur créé avec succès
 *       400:
 *         description: Erreur de validation
 */
router.post('/', createAdmin); // Pas besoin d'authentification ici

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Obtenir tous les administrateurs
 *     description: Récupère la liste de tous les administrateurs
 *     security:
 *       - bearerAuth: []  # Assurez-vous d'ajouter la sécurité si nécessaire
 *     responses:
 *       200:
 *         description: Liste des administrateurs
 *       401:
 *         description: Authentification requise
 *       500:
 *         description: Erreur du serveur
 */
router.get('/', authenticate, getAdmins);

/**
 * @swagger
 * /admin/{id}:
 *   put:
 *     summary: Mettre à jour un administrateur
 *     description: Met à jour les informations d'un administrateur existant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'administrateur à mettre à jour
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Administrateur mis à jour avec succès
 *       404:
 *         description: Administrateur non trouvé
 *       401:
 *         description: Authentification requise
 *       500:
 *         description: Erreur du serveur
 */
router.put('/:id', authenticate, updateAdmin);

/**
 * @swagger
 * /admin/{id}:
 *   delete:
 *     summary: Supprimer un administrateur
 *     description: Supprime un administrateur existant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'administrateur à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Administrateur supprimé avec succès
 *       404:
 *         description: Administrateur non trouvé
 *       401:
 *         description: Authentification requise
 *       500:
 *         description: Erreur du serveur
 */
router.delete('/:id', authenticate, deleteAdmin);

export default router;