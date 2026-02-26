import React, { useState } from 'react';
import { Button } from './common';

const StatusToggle = ({ sujet, onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);

  const toggleStatus = async () => {
    try {
      setIsLoading(true);
      
      const endpoint = sujet.statut 
        ? `http://localhost:8080/api/sujets/${sujet.id}/desactiver`
        : `http://localhost:8080/api/sujets/${sujet.id}/activer`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const updatedSujet = await response.json();
        onStatusChange(updatedSujet);
      } else {
        console.error('Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={sujet.statut ? "outline" : "primary"}
      onClick={toggleStatus}
      disabled={isLoading}
      className="flex items-center space-x-1"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        <>
          {sujet.statut ? (
            <>
              <span>🔴</span>
              <span>Désactiver</span>
            </>
          ) : (
            <>
              <span>🟢</span>
              <span>Activer</span>
            </>
          )}
        </>
      )}
    </Button>
  );
};

export default StatusToggle;












