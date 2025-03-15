import express from 'express';
import participantRoutes from './routes/participantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import anniversaireRoutes from './routes/anniversaireRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.get('/', async (req, res) => {
  res.send('happy birthday');
});

// Configuration du middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/participants', participantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/anniversaires', anniversaireRoutes);

// erreur du middleware
app.use((req, res, next) => {
  const error = new Error('Page non trouvée');
  error.status = 404;
  next(error);
});

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});