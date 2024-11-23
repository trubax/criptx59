import { db } from "../firebase";
import { collection, query, where, getDocs, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { ChatService } from "./ChatService";
import type { Service, ServiceMatch } from "../types";

interface MatchCriteria {
  title: string;
  type: 'offered' | 'requested';
  keywords: string[];
}

export class MatchingService {
  async findMatches(serviceId: string, criteria: MatchCriteria): Promise<ServiceMatch[]> {
    const servicesRef = collection(db, 'services');
    const q = query(
      servicesRef,
      where('type', '==', criteria.type === 'offered' ? 'requested' : 'offered')
    );

    const matches: ServiceMatch[] = [];
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(doc => {
      const service = doc.data() as Service;
      const score = this.calculateMatchScore(criteria, {
        title: service.name,
        type: service.type,
        keywords: service.description?.toLowerCase().split(/\s+/) || []
      });

      if (score > 0) {
        matches.push({
          id: doc.id,
          service1: { id: serviceId, name: criteria.title, userId: service.userId },
          service2: { id: doc.id, name: service.name, userId: service.userId },
          score,
          status: 'pending'
        });
      }
    });

    return matches;
  }

  private calculateMatchScore(criteria1: MatchCriteria, criteria2: MatchCriteria): number {
    let score = 0;
    
    // Match per titolo (30%)
    if (criteria1.title.toLowerCase() === criteria2.title.toLowerCase()) {
      score += 0.3;
    }
    
    // Match per keywords (70%)
    const commonKeywords = criteria1.keywords.filter(k => 
      criteria2.keywords.includes(k)
    );
    score += (commonKeywords.length / Math.max(criteria1.keywords.length, criteria2.keywords.length)) * 0.7;
    
    return score;
  }
} 