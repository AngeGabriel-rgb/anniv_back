import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js'; 
import {
    getAllParticipants,
    getParticipantById,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    regenerateParticipantCode,
    getAllAnniversaires,
    getAnniversaireById,
    createAnniversaire,
    updateAnniversaire,
    deleteAnniversaire,
    addParticipantToAnniversaire,
    removeParticipantFromAnniversaire,
    getAllAdministrateurs,
    getAdministrateurById,
    createAdministrateur,
    updateAdministrateur,
    deleteAdministrateur,
} from '../controllers/adminController.js';

const router = express.Router();

// Appliquer le middleware d'authentification
router.use(authenticate);

// Middleware pour vérifier si l'utilisateur est un administrateur
const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé. Vous devez être administrateur.' });
    }
    next();
};

// Appliquer le middleware d'administrateur à toutes les routes
router.use(isAdmin);

// ===== ROUTES POUR LA GESTION DES PARTICIPANTS =====
router.get('/participants', getAllParticipants);
router.get('/participants/:id', getParticipantById);
router.post('/participants', createParticipant);
router.put('/participants/:id', updateParticipant);
router.delete('/participants/:id', deleteParticipant);
router.post('/participants/:id/regenerate-code', regenerateParticipantCode);

// ===== ROUTES POUR LA GESTION DES ANNIVERSAIRES =====
router.get('/anniversaires', getAllAnniversaires);
router.get('/anniversaires/:id', getAnniversaireById);
router.post('/anniversaires', createAnniversaire);
router.put('/anniversaires/:id', updateAnniversaire);
router.delete('/anniversaires/:id', deleteAnniversaire);
router.post('/anniversaires/:id/participants', addParticipantToAnniversaire);
router.delete('/anniversaires/:id/participants/:participantId', removeParticipantFromAnniversaire);

// ===== ROUTES POUR LA GESTION DES ADMINISTRATEURS =====
router.get('/administrateurs', getAllAdministrateurs);
router.get('/administrateurs/:id', getAdministrateurById);
router.post('/administrateurs', createAdministrateur);
router.put('/administrateurs/:id', updateAdministrateur);
router.delete('/administrateurs/:id', deleteAdministrateur);

//routes pour se connecter
router.post('/login', (req, res) => {
  res.json({ message: 'Connexion réussie' });
});
//routes pour se déconnecter
router.post('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});
export default router;