import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { SessionService } from '../../services/SessionService';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { X, ChevronUp, ChevronDown, Monitor, Smartphone, Globe } from 'lucide-react';

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

export function SessionsManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expanded, setExpanded] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const loadSessions = async () => {
    if (!currentUser) return;
    const sessionsData = await SessionService.getInstance().getSessions(currentUser.uid);
    setSessions(sessionsData);
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!currentUser) return;
    await SessionService.getInstance().terminateSession(currentUser.uid, sessionId);
    await loadSessions(); // Ricarica la lista dopo la terminazione
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <h3 className="text-lg font-semibold text-white">Dispositivi Connessi</h3>
        {expanded ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          {sessions.map(session => (
            <div key={session.sessionId} 
              className={`p-3 rounded-lg ${
                session.isCurrentSession ? 'bg-green-800' : 'bg-gray-700'
              } hover:bg-opacity-90 transition-colors`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {session.deviceInfo.platform === 'Mobile' ? (
                      <Smartphone className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Monitor className="w-4 h-4 text-gray-400" />
                    )}
                    <p className="text-white font-medium">
                      {session.deviceInfo.browser} su {session.deviceInfo.os}
                      {session.isCurrentSession && " (Sessione corrente)"}
                    </p>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">
                    Ultimo accesso: {formatDistanceToNow(session.lastActive, { addSuffix: true, locale: it })}
                  </p>
                </div>
                {!session.isCurrentSession && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTerminateSession(session.sessionId);
                    }}
                    className="text-red-400 hover:text-red-300">
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