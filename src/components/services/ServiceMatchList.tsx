import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MatchingService } from '../services/MatchingService';

export function ServiceMatchList() {
  const [matches, setMatches] = useState<ServiceMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const matchingService = new MatchingService();

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const userServices = await getUserServices(currentUser.uid);
        const allMatches = await Promise.all(
          userServices.map(service => matchingService.findMatches(service.id))
        );
        
        setMatches(allMatches.flat().sort((a, b) => b.score - a.score));
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentUser]);

  const handleStartChat = async (match: ServiceMatch) => {
    try {
      const chatId = await matchingService.createServiceChat(match);
      // Naviga alla chat
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <div className="space-y-4">
      {matches.map(match => (
        <div key={match.id} className="p-4 rounded-lg theme-bg-secondary">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold theme-text">
                Match ({(match.score * 100).toFixed(0)}% compatibilità)
              </h3>
              <p className="text-sm theme-text-secondary mt-1">
                {match.service1.name} ↔️ {match.service2.name}
              </p>
            </div>
            <button
              onClick={() => handleStartChat(match)}
              className="px-4 py-2 rounded theme-bg-accent theme-text-accent text-sm"
            >
              Avvia Chat
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 