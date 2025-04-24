import pkg from '@prisma/client';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Créer un nouvel administrateur et le connecter
export const createAdmin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Vérifiez si l'email existe déjà
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcryptjs.hash(password, 8);

    // Créer l'administrateur
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'ADMIN', // Par défaut, le rôle est ADMIN
      },
    });

    // Générer un token JWT avec isAdmin
    const token = jwt.sign(
      { id: newAdmin.id, role: newAdmin.role, isAdmin: true }, // Ajoutez isAdmin ici
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    // Répondre avec le token et les informations de l'administrateur
    res.status(201).json({ message: 'Administrateur créé et connecté avec succès', token, admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'administrateur', error });
  }
};

// Obtenir tous les administrateurs
export const getAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      where: { role: 'ADMIN' },
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des administrateurs', error });
  }
};

// Mettre à jour un administrateur
export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;

  try {
    const updatedAdmin = await prisma.admin.update({
      where: { id: Number(id) },
      data: { email, role },
    });

    res.json({ message: 'Administrateur mis à jour avec succès', admin: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'administrateur', error });
  }
};

// Supprimer un administrateur
export const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.admin.delete({
      where: { id: Number(id) },
    });

    res.json({ message: 'Administrateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'administrateur:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'administrateur', error });
  }
};
