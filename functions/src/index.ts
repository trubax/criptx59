import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendDeleteAccountVerification = functions.https.onCall(async (data, context) => {
  const { email, verificationCode, displayName } = data;
  
  const mailOptions = {
    from: '"CriptX" <noreply@criptx.com>',
    to: email,
    subject: 'Conferma eliminazione account CriptX',
    html: `
      <h2>Ciao ${displayName},</h2>
      <p>Hai richiesto l'eliminazione del tuo account CriptX.</p>
      <p>Per confermare l'eliminazione, inserisci questo codice nell'app:</p>
      <h1 style="font-size: 24px; color: #e11d48; letter-spacing: 2px;">${verificationCode}</h1>
      <p>Se non hai richiesto tu l'eliminazione dell'account, ignora questa email.</p>
      <p>Il codice scadrà tra 15 minuti.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Errore invio email:', error);
    throw new functions.https.HttpsError('internal', 'Errore nell\'invio dell\'email');
  }
}); 