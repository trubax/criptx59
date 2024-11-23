import { useState } from 'react';
import { MatchingService } from '../../services/MatchingService';
import { ServiceMatchCard } from './ServiceMatchCard';
import type { Service, ServiceMatch } from '../../types';
import { ArrowsUpDown } from 'lucide-react';

interface ServiceMatchButtonProps {
  services: Service[];
  isOwnProfile: boolean;
}

export function ServiceMatchButton({ services, isOwnProfile }: ServiceMatchButtonProps) {
  const [showMatches, setShowMatches] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<ServiceMatch[]>([]);

  const handleFindMatches = async () => {
    setLoading(true);
    try {
      const matchingService = new MatchingService();
      const allMatches = await Promise.all(
        services.map(service => matchingService.findMatches(service.id, {
          title: service.name,
          type: service.type,
          keywords: service.description?.toLowerCase().split(/\s+/) || []
        }))
      );
      
      const uniqueMatches = Array.from(
        new Set(allMatches.flat().map(m => m.id))
      ).map(id => allMatches.flat().find(m => m.id === id)!);
      
      setMatches(uniqueMatches.sort((a, b) => b.score - a.score));
      setShowMatches(true);
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={handleFindMatches}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded theme-bg-accent theme-text-accent"
      >
        <ArrowsUpDown className="w-5 h-5" />
        {loading ? 'Ricerca...' : 'Avvia Match'}
      </button>
      
      {showMatches && matches.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold theme-text mb-2">Utenti Compatibili</h3>
          <div className="grid gap-4">
            {matches.map(match => (
              <ServiceMatchCard 
                key={match.id} 
                match={match}
                isOwnProfile={isOwnProfile}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 