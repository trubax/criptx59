import { Dialog } from '../ui/Dialog';
import { Service, ServiceCategory } from '../../types/service';
import { useState } from 'react';

const SERVICE_CATEGORIES: ServiceCategory[] = [
  'development',
  'design',
  'marketing',
  'writing',
  'consulting',
  'other'
];

interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'offered' | 'requested';
  onSubmit: (service: Partial<Service>) => Promise<void>;
}

export function ServiceModal({ open, onOpenChange, type, onSubmit }: ServiceModalProps) {
  const [service, setService] = useState<Partial<Service>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(service);
      setService({});
      onOpenChange(false);
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4 theme-bg-primary">
        <h3 className="text-xl font-semibold theme-text">
          {type === 'offered' ? 'Aggiungi Servizio Offerto' : 'Aggiungi Servizio Richiesto'}
        </h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium theme-text">Nome del servizio</label>
          <input
            type="text"
            required
            value={service.name || ''}
            onChange={(e) => setService({ ...service, name: e.target.value })}
            className="w-full p-2 rounded-lg theme-bg-secondary theme-text theme-border border"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium theme-text">Categoria</label>
          <select
            required
            value={service.category || ''}
            onChange={(e) => setService({ ...service, category: e.target.value as ServiceCategory })}
            className="w-full p-2 rounded-lg theme-bg-secondary theme-text theme-border border"
          >
            <option value="">Seleziona categoria</option>
            {SERVICE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium theme-text">Descrizione</label>
          <textarea
            required
            value={service.description || ''}
            onChange={(e) => setService({ ...service, description: e.target.value })}
            className="w-full p-2 rounded-lg theme-bg-secondary theme-text theme-border border min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium theme-text">Tariffa (opzionale)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Importo"
              value={service.rate?.amount || ''}
              onChange={(e) => setService({
                ...service,
                rate: {
                  ...service.rate,
                  amount: parseFloat(e.target.value)
                }
              })}
              className="p-2 rounded-lg theme-bg-secondary theme-text theme-border border"
            />
            <select
              value={service.rate?.unit || 'hour'}
              onChange={(e) => setService({
                ...service,
                rate: {
                  ...service.rate,
                  unit: e.target.value as 'hour' | 'project' | 'day'
                }
              })}
              className="p-2 rounded-lg theme-bg-secondary theme-text theme-border border"
            >
              <option value="hour">all'ora</option>
              <option value="day">al giorno</option>
              <option value="project">a progetto</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg theme-bg-secondary theme-text opacity-70 hover:opacity-100"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg theme-bg-accent theme-text-accent disabled:opacity-50"
          >
            {loading ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </form>
    </Dialog>
  );
} 