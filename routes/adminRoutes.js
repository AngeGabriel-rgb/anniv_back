import express from 'express';
import {
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route pour créer un administrateur
router.post('/', createAdmin); // Pas besoin d'authentification ici

// Route pour obtenir tous les administrateurs
router.get('/', authenticate, getAdmins);

// Route pour mettre à jour un administrateur
router.put('/:id', authenticate, updateAdmin);

// Route pour supprimer un administrateur
router.delete('/:id', authenticate, deleteAdmin);

export default router;