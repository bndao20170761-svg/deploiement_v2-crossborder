import React, { useState } from 'react';
import { Button } from './common';
import { useAuth } from '../contexts/AuthContext';

const CommentModal = ({ isOpen, onClose, sujetId, onCommentAdded }) => {
  const { isAuthenticated } = useAuth();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!isAuthenticated) {
      alert('Vous devez être connecté pour commenter');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/commentaires/sujet/${sujetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          contenu: comment,
          langue: 'fr'
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const newComment = await response.json();
      console.log('Commentaire ajouté:', newComment);
      
      if (onCommentAdded) {
        onCommentAdded();
      }
      
      setComment('');
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      alert('Erreur lors de l\'ajout du commentaire. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            💬 Ajouter un commentaire
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">Vous devez être connecté pour commenter</p>
            <Button href="/login" size="sm">
              Se connecter
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Écrivez votre commentaire ici..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vih-primary focus:border-transparent resize-none"
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading || !comment.trim()}
              >
                {loading ? 'Ajout...' : 'Publier'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CommentModal;
