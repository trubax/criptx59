import { useGeolocation } from '../hooks/useGeolocation';

export default function LocationTracker() {
  const { 
    location, 
    getPosition, 
    startWatching, 
    stopWatching, 
    watching 
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <button
          onClick={getPosition}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Ottieni Posizione
        </button>
        
        <button
          onClick={watching ? stopWatching : startWatching}
          className={`px-4 py-2 ${
            watching ? 'bg-red-500' : 'bg-green-500'
          } text-white rounded-lg`}
        >
          {watching ? 'Stop Tracking' : 'Avvia Tracking'}
        </button>
      </div>

      {location.error ? (
        <div className="text-red-500">
          Errore: {location.error}
        </div>
      ) : location.latitude && location.longitude ? (
        <div className="space-y-2">
          <div>Latitudine: {location.latitude}</div>
          <div>Longitudine: {location.longitude}</div>
          <div>Precisione: {location.accuracy}m</div>
          <div>Ultimo aggiornamento: {
            new Date(location.timestamp || 0).toLocaleTimeString()
          }</div>
        </div>
      ) : (
        <div>In attesa della posizione...</div>
      )}
    </div>
  );
} 