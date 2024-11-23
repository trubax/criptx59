import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Service } from '../../types/service';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface ServiceMatch {
  id: string;
  service1: Service;
  service2: Service;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export function ServiceMatches() {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<ServiceMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const matchesRef = collection(db, 'serviceMatches');
    const q = query(
      matchesRef,
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const matchesData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const [service1Doc, service2Doc] = await Promise.all([
            getDoc(doc(db, 'services', data.service1)),
            getDoc(doc(db, 'services', data.service2))
          ]);

          return {
            id: doc.id,
            service1: { id: service1Doc.id, ...service1Doc.data() } as Service,
            service2: { id: service2Doc.id, ...service2Doc.data() } as Service,
            status: data.status,
            createdAt: data.createdAt.toDate()
          } as ServiceMatch;
        })
      );

      setMatches(matchesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleMatchAction = async (matchId: string, action: 'accept' | 'reject') => {
    try {
      const matchRef = doc(db, 'serviceMatches', matchId);
      await updateDoc(matchRef, {
        status: action === 'accept' ? 'accepted' : 'rejected',
        updatedAt: serverTimestamp()
      });

      // Se accettato, crea una chat tra gli utenti
      if (action === 'accept') {
        const match = matches.find(m => m.id === matchId);
        if (match) {
          const chatService = ChatService.getInstance();
          const chatId = await chatService.createIndividualChat(
            { uid: match.service1.userId } as User,
            match.service2.userId
          );

          await chatService.sendMessage(
            chatId,
            'system',
            'Sistema',
            `Match confermato! Servizio "${match.service1.name}" con "${match.service2.name}"`
          );
        }
      }
    } catch (error) {
      console.error('Error handling match action:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center theme-text">Caricamento match...</div>;
  }

  return (
    <div className="space-y-4">
      {matches.map(match => (
        <div key={match.id} className="p-4 rounded-lg theme-bg-secondary">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold theme-text">Match Trovato!</h3>
              <p className="text-sm theme-text-secondary">
                {match.service1.userId === currentUser?.uid ? (
                  <>Il tuo servizio "{match.service1.name}" corrisponde a "{match.service2.name}"</>
                ) : (
                  <>Il tuo servizio "{match.service2.name}" corrisponde a "{match.service1.name}"</>
                )}
              </p>
            </div>
            {match.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleMatchAction(match.id, 'accept')}
                  className="px-3 py-1 rounded theme-bg-accent theme-text-accent text-sm"
                >
                  Accetta
                </button>
                <button
                  onClick={() => handleMatchAction(match.id, 'reject')}
                  className="px-3 py-1 rounded theme-bg-error theme-text-error text-sm"
                >
                  Rifiuta
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 