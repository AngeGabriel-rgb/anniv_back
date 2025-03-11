import nodemailer from 'nodemailer';

// Créer un compte de test Ethereal pour le développement
export const createTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  
  console.log('Compte de test Ethereal créé:');
  console.log('- Email:', testAccount.user);
  console.log('- Mot de passe:', testAccount.pass);
  console.log('- SMTP Host:', testAccount.smtp.host);
  console.log('- SMTP Port:', testAccount.smtp.port);
  
  return testAccount;
};

// Créer un transporteur d'email
export const createTransporter = async () => {
  // Si nous sommes en développement et que les variables d'environnement ne sont pas définies
  if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_HOST) {
    const testAccount = await createTestAccount();
    
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  
  // Sinon, utiliser les variables d'environnement
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Envoyer un email
export const sendEmail = async (to, subject, html) => {
  const transporter = await createTransporter();
  
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Système de Gestion" <noreply@example.com>',
    to,
    subject,
    html,
  });
  
  // Si nous utilisons Ethereal, afficher l'URL de prévisualisation
  if (info.messageId && info.previewURL) {
    console.log('Email envoyé:', info.messageId);
    console.log('Prévisualiser l\'email:', info.previewURL);
  }
  
  return info;
};

// Modèles d'emails
export const emailTemplates = {
  // Email de confirmation d'inscription
  confirmationEmail: (nom, prenom, confirmationUrl) => `
    <h2>Confirmation de votre inscription</h2>
    <p>Bonjour ${prenom} ${nom},</p>
    <p>Merci de vous être inscrit sur notre plateforme de gestion des participants.</p>
    <p>Veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse email :</p>
    <p>
      <a href="${confirmationUrl}">
        Confirmer mon adresse email
      </a>
    </p>
    <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
  `,
  
  // Email avec le code unique
  uniqueCodeEmail: (nom, prenom, code) => `
    <h2>Votre code unique</h2>
    <p>Bonjour ${prenom} ${nom},</p>
    <p>Voici votre code unique pour accéder à notre plateforme :</p>
    <p style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">${code}</p>
    <p>Conservez ce code précieusement, il vous sera demandé lors de la connexion.</p>
    <p>Si vous n'êtes pas à l'origine de cette demande, veuillez nous contacter immédiatement.</p>
  `,
};
