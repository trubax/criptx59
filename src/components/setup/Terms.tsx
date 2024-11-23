import { StepIndicator } from './StepIndicator';

interface TermsProps {
  onAccept: () => void;
  steps: SetupStep[];
}

export function Terms({ onAccept, steps }: TermsProps) {
  return (
    <div className="setup-container">
      <StepIndicator steps={steps} currentStep={0} />
      <div className="prose theme-text max-w-none pb-4">
        <h2>Termini di Utilizzo di CriptX</h2>
        
        <h3>1. Introduzione</h3>
        <p>
          CriptX è un'applicazione di messaggistica sicura che permette agli utenti di comunicare 
          in modo privato e protetto. Utilizzando CriptX, accetti questi termini di utilizzo.
        </p>

        <h3>2. Privacy e Sicurezza</h3>
        <p>
          - Tutti i messaggi sono crittografati end-to-end
          - I dati personali sono protetti secondo il GDPR
          - Le chiavi di crittografia sono generate localmente
          - Non memorizziamo i contenuti delle conversazioni
        </p>

        <h3>3. Trattamento dei Dati Personali</h3>
        <p>
          Raccogliamo e trattiamo i seguenti dati:
          - Email e nome per l'autenticazione
          - Foto del profilo (opzionale)
          - Dati di utilizzo anonimi per migliorare il servizio
          - Metadati delle conversazioni (non i contenuti)
        </p>

        <h3>4. Responsabilità dell'Utente</h3>
        <p>
          - Non utilizzare CriptX per attività illegali
          - Rispettare la privacy degli altri utenti
          - Mantenere sicure le proprie credenziali
          - Segnalare comportamenti sospetti
        </p>
      </div>
    </div>
  );
} 