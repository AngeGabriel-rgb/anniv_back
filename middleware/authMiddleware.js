import jwt from 'jsonwebtoken'; // Make sure to import jwt

const authenticate = (req, res, next) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Veuillez vous authentifier' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "anniversaire"); // Use environment variable

    req.participantId = decodedToken.userId; // Adjust based on your token structure
    req.adminId = decodedToken.adminId; // Adjust based on your token structure

    if (!req.participantId) {
      return res.status(401).json({ message: 'Veuillez vous authentifier' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Veuillez vous authentifier' });
  }
};

export { authenticate };