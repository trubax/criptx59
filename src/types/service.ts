export type ServiceCategory = 
  | 'development' 
  | 'design' 
  | 'marketing' 
  | 'writing' 
  | 'consulting' 
  | 'other';

export type ServiceStatus = 'active' | 'paused' | 'completed';

export interface Service {
  id: string;
  userId: string;
  type: 'offered' | 'requested';
  name: string;
  description: string;
  category: ServiceCategory;
  rate?: {
    amount: number;
    currency: string;
    unit: 'hour' | 'project' | 'day';
  };
  availability?: {
    status: ServiceStatus;
    schedule?: string;
    startDate?: Date;
    endDate?: Date;
  };
  skills: string[];
  location: {
    type: 'remote' | 'onsite' | 'hybrid';
    places?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceSearchFilters {
  categories?: ServiceCategory[];
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: ServiceStatus;
  skills?: string[];
  type: 'offered' | 'requested';
} 