interface SessionItemProps {
  session: Session;
  onTerminate: (sessionId: string) => void;
  currentUser: any;
}

export function SessionItem({ session, onTerminate, currentUser }: SessionItemProps) {
  return (
    <div className={`p-3 rounded-lg ${
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
          <p className="text-sm text-gray-400">
            Ultimo accesso: {formatDistanceToNow(session.lastActive, { locale: it })}
          </p>
        </div>
        {!session.isCurrentSession && (
          <button onClick={() => onTerminate(session.sessionId)}>
            <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
} 