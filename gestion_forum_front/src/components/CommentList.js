import React, { useState, useEffect } from 'react';
import { Button } from './common';

const CommentList = ({ sujetId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [sujetId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/commentaires/sujet/${sujetId}/all`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des commentaires:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-vih-primary"></div>
        <span className="ml-2 text-sm text-gray-600">Chargement des commentaires...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">Erreur lors du chargement des commentaires</p>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={fetchComments}
          className="mt-2"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">Aucun commentaire pour le moment</p>
        <p className="text-gray-400 text-xs mt-1">Soyez le premier à commenter !</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          💬 Commentaires ({comments.length})
        </h4>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={fetchComments}
          className="text-xs"
        >
          🔄 Actualiser
        </Button>
      </div>
      
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm text-gray-900">
                {comment.auteur?.prenom} {comment.auteur?.nom}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.dateCreation)}
              </span>
            </div>
            <span className="text-xs text-gray-400 uppercase">
              {comment.langueOriginale}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {comment.contenuOriginal}
          </p>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs px-2 py-1"
              >
                👍 Répondre
              </Button>
            </div>
            <span className="text-xs text-gray-400">
              {comment.statut === 'ACTIF' ? '🟢 Actif' : '🔴 Inactif'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;












