import React, { useState, useEffect } from 'react';
import { topicsService } from '../services/api';

const TopicStats = ({ className = "" }) => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Récupérer les statistiques en parallèle
        const [allTopics, activeTopics, inactiveTopics, recentTopics] = await Promise.all([
          topicsService.getAllTopics({ page: 0, size: 1 }),
          topicsService.getActiveTopics({ page: 0, size: 1 }),
          topicsService.getInactiveTopics({ page: 0, size: 1 }),
          topicsService.getRecentTopics(1)
        ]);

        setStats({
          total: allTopics.length,
          active: activeTopics.length,
          inactive: inactiveTopics.length,
          recent: recentTopics.length
        });
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="animate-pulse bg-gray-200 h-8 w-16 mx-auto mb-2 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-20 mx-auto rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: '📊',
      label: 'Total',
      value: stats.total,
      color: 'text-blue-600'
    },
    {
      icon: '🟢',
      label: 'Actifs',
      value: stats.active,
      color: 'text-green-600'
    },
    {
      icon: '🔴',
      label: 'Inactifs',
      value: stats.inactive,
      color: 'text-red-600'
    },
    {
      icon: '🆕',
      label: 'Récents',
      value: stats.recent,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {statItems.map((stat, index) => (
        <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm border">
          <div className="text-2xl mb-2">{stat.icon}</div>
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-600">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopicStats;

































