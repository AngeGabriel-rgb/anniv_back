import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendUniqueCodeEmail = async (email, prenom, nom, code_unique) => {
  try {
    const mailOptions = {
      from: `"Équipe Anniversaire" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Votre code unique',
      html: `
        <h2 style="color: #2d3748;">Votre code unique</h2>
        <p>Bonjour ${prenom} ${nom},</p>
        <p>Voici votre code unique pour accéder à notre plateforme :</p>
        <div style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #f0f0f0; border-radius: 5px; margin: 20px 0;">${code_unique}</div>
        <p>Conservez ce code précieusement.</p>
        <p style="color: #718096;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé à ${email}`);
  } catch (error) {
    console.error(`Erreur lors de l'envoi à ${email}:`, error);
    throw new Error("Échec de l'envoi de l'email");
  }
};

