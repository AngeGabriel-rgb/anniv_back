import express from 'express';
import { 
  adminlogin, 
  participantRegister, 
  confirmEmail, 
  participantLogin,
  adminregister,
  userLogin
} from '../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Authentifier un administrateur
 *     description: Permet à un administrateur de se connecter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie
 *       401:
 *         description: Identifiants invalides
 *       500:
 *         description: Erreur du serveur
 */
router.post('/admin/login', adminlogin);

/**
 * @swagger
 * /auth/admin/register:
 *   post:
 *     summary: Enregistrer un nouvel administrateur
 *     description: Permet de créer un nouvel administrateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Administrateur créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur du serveur
 */
router.post('/admin/register', adminregister);

/**
 * @swagger
 * /auth/user/login:
 *   post:
 *     summary: Authentifier un super administrateur
 *     description: Permet à un super administrateur de se connecter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie
 *       401:
 *         description: Identifiants invalides
 *       500:
 *         description: Erreur du serveur
 */
router.post('/user/login', userLogin);

/**
 * @swagger
 * /auth/participants/register:
 *   post:
 *     summary: Enregistrer un participant
 *     description: Permet de créer un nouvel utilisateur participant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Participant créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur du serveur
 */
router.post('/participants/register', participantRegister);

/**
 * @swagger
 * /auth/participants/confirm-email:
 *   get:
 *     summary: Confirmer l'email d'un participant
 *     description: Permet de confirmer l'email d'un participant
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Token de confirmation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email confirmé avec succès
 *       400:
 *         description: Token invalide ou expiré
 *       500:
 *         description: Erreur du serveur
 */
router.get('/participants/confirm-email', confirmEmail);

/**
 * @swagger
 * /auth/participants/login:
 *   post:
 *     summary: Authentifier un participant
 *     description: Permet à un participant de se connecter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie
 *       401:
 *         description: Identifiants invalides
 *       500:
 *         description: Erreur du serveur
 */
router.post('/participants/login', participantLogin);

export default router;