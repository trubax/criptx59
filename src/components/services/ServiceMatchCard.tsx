import { useAuth } from '../../hooks/useAuth';
import { ChatService } from '../../services/ChatService';
import { useNavigate } from 'react-router-dom';

interface ServiceMatchCardProps {
  match: ServiceMatch;
}

export function ServiceMatchCard({ match }: ServiceMatchCardProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const isMyService = match.service1.userId === currentUser?.uid;
  const compatibleService = isMyService ? match.service2 : match.service1;
  const compatibilityScore = Math.round(match.score * 100);

  const handleStartChat = async () => {
    try {
      const chatService = ChatService.getInstance();
      const chatId = await chatService.createIndividualChat(
        currentUser!,
        compatibleService.userId,
        'service'  // Aggiungi il tipo chat
      );
      
      // Invia messaggio di sistema
      await chatService.sendMessage(
        chatId,
        'system',
        'Sistema',
        `Chat servizi avviata per:\n${match.service1.name} ↔️ ${match.service2.name}`
      );

      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <div className="p-4 rounded-lg theme-bg-secondary">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium theme-text">{compatibleService.name}</h4>
          <p className="text-sm theme-text-secondary mt-1">
            Compatibilità: {compatibilityScore}%
          </p>
        </div>
        <button
          onClick={handleStartChat}
          className="px-4 py-2 rounded theme-bg-accent theme-text-accent text-sm"
        >
          Avvia Chat
        </button>
      </div>
    </div>
  );
} 