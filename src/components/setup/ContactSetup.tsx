import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Phone, Mail, Github, Linkedin, Twitter, Facebook, Instagram, Send, Music, Plus, Trash2 } from 'lucide-react';
import { StepIndicator } from './StepIndicator';

interface ContactSetupProps {
  initialData: {
    phoneNumbers?: string[];
    secondaryEmail?: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      telegram?: string;
      tiktok?: string;
      github?: string;
      linkedin?: string;
      twitter?: string;
    }
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  showBack: boolean;
  steps: SetupStep[];
}

export function ContactSetup({ initialData, onUpdate, onNext, onBack, showBack, steps }: ContactSetupProps) {
  const [formData, setFormData] = useState({
    phoneNumbers: initialData.phoneNumbers || [''],
    secondaryEmail: initialData.secondaryEmail || '',
    socialLinks: {
      facebook: initialData.socialLinks?.facebook || '',
      instagram: initialData.socialLinks?.instagram || '',
      telegram: initialData.socialLinks?.telegram || '',
      tiktok: initialData.socialLinks?.tiktok || '',
      github: initialData.socialLinks?.github || '',
      linkedin: initialData.socialLinks?.linkedin || '',
      twitter: initialData.socialLinks?.twitter || ''
    }
  });

  const handlePhoneNumberChange = (index: number, value: string) => {
    const newPhoneNumbers = [...formData.phoneNumbers];
    newPhoneNumbers[index] = value;
    setFormData(prev => ({
      ...prev,
      phoneNumbers: newPhoneNumbers
    }));
  };

  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, '']
    }));
  };

  const removePhoneNumber = (index: number) => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = () => {
    onUpdate(formData);
    onNext();
  };

  return (
    <div className="setup-container">
      <StepIndicator steps={steps} currentStep={2} />
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold theme-text mb-2">Contatti e Social</h2>
              <p className="theme-text-secondary">
                Aggiungi i tuoi contatti e profili social per essere trovato più facilmente
              </p>
            </div>

            <div className="w-full max-w-md mx-auto space-y-4">
              <div className="bg-opacity-20 theme-bg-secondary p-6 rounded-lg space-y-4">
                {/* Numeri di telefono */}
                {formData.phoneNumbers.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium theme-text">
                        <Phone className="w-4 h-4" />
                        {index === 0 ? 'Numero di telefono principale' : `Numero di telefono ${index + 1}`}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                        className="w-full p-3 rounded-lg theme-bg-secondary theme-text border theme-border focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="+39 123 456 7890"
                      />
                    </div>
                    {index > 0 && (
                      <button
                        onClick={() => removePhoneNumber(index)}
                        className="self-end p-3 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={addPhoneNumber}
                  className="w-full p-2 rounded-lg border border-dashed theme-border theme-text hover:theme-bg-secondary transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Aggiungi numero
                </button>

                {/* Social Links */}
                {Object.entries({
                  facebook: { icon: Facebook, label: 'Facebook' },
                  instagram: { icon: Instagram, label: 'Instagram' },
                  telegram: { icon: Send, label: 'Telegram' },
                  tiktok: { icon: Music, label: 'TikTok' },
                  github: { icon: Github, label: 'GitHub' },
                  linkedin: { icon: Linkedin, label: 'LinkedIn' },
                  twitter: { icon: Twitter, label: 'Twitter' }
                }).map(([key, { icon: Icon, label }]) => (
                  <div key={key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium theme-text">
                      <Icon className="w-4 h-4" />
                      {label}
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks[key as keyof typeof formData.socialLinks]}
                      onChange={(e) => handleChange(`socialLinks.${key}`, e.target.value)}
                      className="w-full p-3 rounded-lg theme-bg-secondary theme-text border theme-border focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder={`https://${key}.com/username`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-none p-4 border-t theme-border bg-transparent backdrop-blur-sm safe-area-bottom">
          <div className="flex gap-3 w-full">
            {showBack && (
              <button
                onClick={onBack}
                className="flex-1 py-2 px-4 rounded-full transition-colors border theme-border theme-text hover:theme-bg-secondary"
              >
                Indietro
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 px-4 rounded-full transition-colors flex items-center justify-center
                bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              Continua
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 