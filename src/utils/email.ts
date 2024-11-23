import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

const functions = getFunctions(app);

export const sendCustomVerificationEmail = async (
  email: string,
  verificationCode: string,
  displayName: string
) => {
  const sendEmail = httpsCallable(functions, 'sendDeleteAccountVerification');
  
  try {
    const result = await sendEmail({
      email,
      verificationCode,
      displayName
    });
    return result.data;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email:', error);
    throw new Error('Impossibile inviare l\'email di verifica');
  }
}; 