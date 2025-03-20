import jwt from "jsonwebtoken"

export const authenticate = (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Aucun token, autorisation refusée" })
    }

    // Extraire le token
    const token = authHeader.split(" ")[1]

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Ajouter l'utilisateur du payload à la requête
    req.user = decoded

    // Vérifier si l'utilisateur est un administrateur
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Non autorisé en tant qu'administrateur" })
    }

    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token invalide" })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expiré" })
    }
    res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}