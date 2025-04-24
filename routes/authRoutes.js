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

// Routes d'authentification pour les administrateurs
router.post('/admin/login', adminlogin);
router.post('/admin/register', adminregister); 

//Routes d'auth pour le super admin
router.post('/user/login', userLogin);

// Routes d'authentification pour les participants
router.post('/participants/register', participantRegister);
router.get('/participants/confirm-email', confirmEmail);
router.post('/participants/login', participantLogin);

export default router;