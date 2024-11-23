import { Globe, Users, Lock } from 'lucide-react';
import { PrivacySettings } from '../../pages/ProfilePage';
import { useTheme } from '../../contexts/ThemeContext';

interface EditProfileFormProps {
  form: {
    displayName: string;
    bio: string;
    privacy: PrivacySettings;
  };
  setForm: (form: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditProfileForm({ form, setForm, onSave, onCancel }: EditProfileFormProps) {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6 theme-bg-primary p-6 rounded-lg">
      <div>
        <label className="block text-sm font-medium theme-text mb-2">Nome</label>
        <input
          type="text"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          className="w-full p-2 rounded-lg theme-bg-secondary theme-text theme-border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium theme-text mb-2">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="w-full p-2 rounded-lg theme-bg-secondary theme-text theme-border h-24"
        />
      </div>

      <div>
        <label className="block text-sm font-medium theme-text mb-4">Privacy del Profilo</label>
        <div className="space-y-3">
          <button
            onClick={() => setForm({
              ...form,
              privacy: { ...form.privacy, profileVisibility: 'public' }
            })}
            className={`w-full p-3 rounded-lg flex items-center space-x-3 ${
              form.privacy.profileVisibility === 'public' ? 'theme-bg-secondary' : 'theme-bg-primary'
            }`}
          >
            <Globe className="w-5 h-5 theme-text" />
            <div className="text-left">
              <div className="font-medium theme-text">Pubblico</div>
              <div className="text-sm theme-text opacity-70">Tutti possono vedere il tuo profilo</div>
            </div>
          </button>

          <button
            onClick={() => setForm({
              ...form,
              privacy: { ...form.privacy, profileVisibility: 'contacts' }
            })}
            className={`w-full p-3 rounded-lg flex items-center space-x-3 ${
              form.privacy.profileVisibility === 'contacts' ? 'theme-bg-secondary' : 'theme-bg-primary'
            }`}
          >
            <Users className="w-5 h-5 theme-text" />
            <div className="text-left">
              <div className="font-medium theme-text">Solo Contatti</div>
              <div className="text-sm theme-text opacity-70">Solo i tuoi contatti possono vedere il tuo profilo</div>
            </div>
          </button>

          <button
            onClick={() => setForm({
              ...form,
              privacy: { ...form.privacy, profileVisibility: 'private' }
            })}
            className={`w-full p-3 rounded-lg flex items-center space-x-3 ${
              form.privacy.profileVisibility === 'private' ? 'theme-bg-secondary' : 'theme-bg-primary'
            }`}
          >
            <Lock className="w-5 h-5 theme-text" />
            <div className="text-left">
              <div className="font-medium theme-text">Privato</div>
              <div className="text-sm theme-text opacity-70">Nessuno può vedere il tuo profilo</div>
            </div>
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 p-2 rounded-lg theme-bg-secondary theme-text"
        >
          Annulla
        </button>
        <button
          onClick={onSave}
          className="flex-1 p-2 rounded-lg bg-blue-500 text-white"
        >
          Salva
        </button>
      </div>
    </div>
  );
} 