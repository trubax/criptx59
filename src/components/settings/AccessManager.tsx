export function AccessManager() {
  const [accesses, setAccesses] = useState<Access[]>([]);
  const [selectedAccess, setSelectedAccess] = useState<Access | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    loadAccesses();
  }, [currentUser]);

  const loadAccesses = async () => {
    if (!currentUser) return;
    const accessesData = await AccessService.getInstance().getAccesses(currentUser.uid);
    setAccesses(accessesData);
  };

  const handleDeleteAccess = async (accessId: string) => {
    try {
      if (!currentUser) return;
      await AccessService.getInstance().deleteAccess(currentUser.uid, accessId);
      setAccesses(prev => prev.filter(a => a.accessId !== accessId));
    } catch (error) {
      console.error('Errore durante l\'eliminazione dell\'accesso:', error);
    }
  };

  return (
    <div className="space-y-4">
      {accesses.map(access => (
        <div 
          key={access.accessId}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-white">
                {access.deviceInfo.platform}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>{access.deviceInfo.browser}</span>
              <span>•</span>
              <span>{access.deviceInfo.os}</span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              Data accesso: {format(access.timestamp, 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
          <button
            onClick={() => handleDeleteAccess(access.accessId)}
            className="p-2 hover:bg-red-500 rounded-full transition-colors"
            title="Elimina accesso"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        </div>
      ))}
    </div>
  );
} 