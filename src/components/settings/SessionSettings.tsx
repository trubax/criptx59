import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Smartphone, Monitor, Globe, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SessionService } from '../../services/SessionService';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface Session {
  sessionId: string;
  deviceInfo: {
    platform: string;
    browser: string;
    os: string;
  };
  lastActive: Date;
  isCurrentSession: boolean;
  createdAt: Date;
}

interface SessionSettingsProps {
  expanded: boolean;
  onToggle: () => void;
}

export default function SessionSettings({ expanded, onToggle }: SessionSettingsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadSessions();
      const interval = setInterval(loadSessions, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadSessions = async () => {
    if (!currentUser) return;
    const sessionsData = await SessionService.getInstance().getSessions(currentUser.uid);
    setSessions(sessionsData);
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!currentUser) return;
    await SessionService.getInstance().terminateSession(currentUser.uid, sessionId);
    await loadSessions();
  };

  return (
    <div className="theme-bg-primary p-4 rounded-lg">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 theme-text" />
          <div>
            <h3 className="theme-text font-medium">Dispositivi Connessi</h3>
            <p className="text-sm theme-text opacity-70">
              {sessions.length} {sessions.length === 1 ? 'dispositivo attivo' : 'dispositivi attivi'}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="theme-text" /> : <ChevronDown className="theme-text" />}
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          {sessions.map(session => (
            <div 
              key={session.sessionId}
              className={`p-3 rounded-lg ${
                session.isCurrentSession ? 'theme-bg-accent' : 'theme-bg-secondary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {session.deviceInfo.platform === 'Mobile' ? (
                      <Smartphone className="w-4 h-4 theme-text opacity-70" />
                    ) : (
                      <Monitor className="w-4 h-4 theme-text opacity-70" />
                    )}
                    <p className="theme-text font-medium">
                      {session.deviceInfo.browser} su {session.deviceInfo.os}
                      {session.isCurrentSession && " (Sessione corrente)"}
                    </p>
                  </div>
                  <p className="text-sm theme-text opacity-70 mt-1">
                    Ultimo accesso: {formatDistanceToNow(session.lastActive, { addSuffix: true, locale: it })}
                  </p>
                </div>
                {!session.isCurrentSession && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTerminateSession(session.sessionId);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 