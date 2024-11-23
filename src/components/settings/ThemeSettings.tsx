import { Palette } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ThemeSettingsProps {
  expanded: boolean;
  onToggle: () => void;
}

export default function ThemeSettings({ expanded, onToggle }: ThemeSettingsProps) {
  const { theme, setTheme, themeColors } = useTheme();

  return (
    <div>
      <div
        onClick={onToggle}
        className="flex items-center justify-between p-4 cursor-pointer hover:theme-bg-secondary transition-all duration-200"
      >
        <div className="flex items-center space-x-3">
          <Palette className="w-5 h-5 text-purple-500" />
          <div>
            <h3 className="theme-text">Tema</h3>
            <p className="text-sm theme-text opacity-70">
              Personalizza l'aspetto dell'app
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 theme-text" /> : <ChevronDown className="w-5 h-5 theme-text" />}
      </div>

      {expanded && (
        <div className="settings-expand-animation">
          <div className="settings-content p-4 theme-bg-secondary border-t theme-divide">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(themeColors).map(([themeKey, themeData]) => (
                <button
                  key={themeKey}
                  onClick={() => setTheme(themeKey as keyof typeof themeColors)}
                  className={`p-4 rounded-lg flex flex-col items-center space-y-2 transition-all hover:scale-105 ${
                    theme === themeKey ? 'ring-2 ring-offset-2 ring-current' : ''
                  }`}
                  style={{
                    backgroundColor: themeData.primary,
                    color: themeData.text,
                    borderColor: themeData.accent,
                    boxShadow: theme === themeKey ? `0 0 20px ${themeData.accent}` : 'none'
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ 
                      backgroundColor: themeData.accent,
                      boxShadow: `0 0 10px ${themeData.accent}`
                    }}
                  />
                  <span className="text-sm font-medium">{themeData.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 