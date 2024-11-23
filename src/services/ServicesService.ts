import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { Service } from '../types/service';
import { ChatService } from '../services/ChatService';
import { User } from '../types/user';
import { NotificationService } from '../services/NotificationService';

class ServicesService {
  private readonly COLLECTION = 'services';

  async addService(userId: string, service: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    try {
      const serviceData = {
        ...service,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), serviceData);
      
      // Notifica i potenziali match
      await this.notifyPotentialMatches(docRef.id, service);

      return { ...serviceData, id: docRef.id } as Service;
    } catch (error) {
      console.error('Error adding service:', error);
      throw new Error('Errore durante l\'aggiunta del servizio');
    }
  }

  private async notifyPotentialMatches(serviceId: string, newService: Partial<Service>) {
    try {
      const oppositeType = newService.type === 'offered' ? 'requested' : 'offered';
      const matchingServices = await this.findMatchingServices(newService, oppositeType);
      
      // Invia notifiche agli utenti con servizi compatibili
      for (const match of matchingServices) {
        await this.createServiceMatch(serviceId, match.id);
      }
    } catch (error) {
      console.error('Error notifying matches:', error);
    }
  }

  private async findMatchingServices(service: Partial<Service>, type: 'offered' | 'requested'): Promise<Service[]> {
    try {
      const servicesRef = collection(db, this.COLLECTION);
      const q = query(
        servicesRef,
        where('type', '==', type),
        where('category', '==', service.category),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
    } catch (error) {
      console.error('Error finding matching services:', error);
      return [];
    }
  }

  private async createServiceMatch(serviceId1: string, serviceId2: string) {
    try {
      const matchRef = doc(db, 'serviceMatches', `${serviceId1}_${serviceId2}`);
      const matchData = {
        service1: serviceId1,
        service2: serviceId2,
        createdAt: serverTimestamp(),
        status: 'pending',
        participants: [
          (await getDoc(doc(db, this.COLLECTION, serviceId1))).data()?.userId,
          (await getDoc(doc(db, this.COLLECTION, serviceId2))).data()?.userId
        ]
      };

      await setDoc(matchRef, matchData);

      // Invia notifica
      const notificationService = new NotificationService();
      const match = {
        id: matchRef.id,
        service1: await this.getServiceById(serviceId1),
        service2: await this.getServiceById(serviceId2),
        status: 'pending',
        createdAt: new Date()
      };

      await notificationService.sendServiceMatchNotification(match);

      return matchRef.id;
    } catch (error) {
      console.error('Error creating service match:', error);
      throw error;
    }
  }

  private async getServiceById(serviceId: string): Promise<Service> {
    try {
      const serviceRef = doc(db, this.COLLECTION, serviceId);
      const serviceData = await getDoc(serviceRef);
      return { ...serviceData.data(), id: serviceData.id } as Service;
    } catch (error) {
      console.error('Error getting service by id:', error);
      throw new Error('Errore durante la ricerca del servizio');
    }
  }
}

export const servicesService = new ServicesService(); 