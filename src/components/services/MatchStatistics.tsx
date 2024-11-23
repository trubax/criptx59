import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function MatchStatistics() {
  const [stats, setStats] = useState({
    totalMatches: 0,
    successfulMatches: 0,
    averageMatchScore: 0,
    matchesByCategory: []
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    // Implementa la logica per recuperare le statistiche da Firebase
  };

  return (
    <div className="p-4 theme-bg-primary rounded-lg">
      <h2 className="text-xl font-semibold theme-text mb-4">Statistiche Match</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Match Totali"
          value={stats.totalMatches}
        />
        <StatCard 
          title="Match di Successo"
          value={stats.successfulMatches}
        />
        <StatCard 
          title="Score Medio"
          value={`${(stats.averageMatchScore * 100).toFixed(1)}%`}
        />
      </div>

      <div className="mt-6">
        <h3 className="font-semibold theme-text mb-2">Match per Categoria</h3>
        <BarChart width={600} height={300} data={stats.matchesByCategory}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="var(--accent)" />
        </BarChart>
      </div>
    </div>
  );
} 