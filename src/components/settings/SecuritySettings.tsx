import { useState } from 'react';
import { Lock, History } from 'lucide-react';
import { AccessManager } from './AccessManager';
import { Switch } from '../ui/Switch';

export default function SecuritySettings({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const [showAccesses, setShowAccesses] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const SecurityItem = ({ icon: Icon, title, description, onClick, isExpanded, hasToggle, isToggled, onToggle }: any) => (
    <div className="border-b last:border-b-0 border-gray-700">
      <div
        onClick={onClick}
        className="flex items-center justify-between p-4 cursor-pointer hover:theme-bg-secondary transition-all duration-200"
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-cyan-500" />
          <div>
            <h3 className="theme-text">{title}</h3>
            <p className="text-sm theme-text opacity-70">{description}</p>
          </div>
        </div>
        {hasToggle ? (
          <Switch
            checked={isToggled}
            onCheckedChange={onToggle}
          />
        ) : null}
      </div>
      {isExpanded && (
        <div className="border-t border-gray-700">
          {title === "Accessi" && <AccessManager />}
        </div>
      )}
    </div>
  );

  return (
    <div className="theme-bg-secondary">
      <SecurityItem
        icon={Lock}
        title="Verifica in due passaggi"
        description="Aumenta la sicurezza del tuo account"
        hasToggle={true}
        isToggled={twoFactorEnabled}
        onToggle={(checked: boolean) => setTwoFactorEnabled(checked)}
      />
      <SecurityItem
        icon={History}
        title="Accessi"
        description="Cronologia degli accessi al tuo account"
        onClick={() => setShowAccesses(!showAccesses)}
        isExpanded={showAccesses}
        hasToggle={false}
      />
    </div>
  );
} 