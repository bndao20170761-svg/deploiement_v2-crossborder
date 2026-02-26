import React from 'react';
import { navigateToMicroservice, openMicroserviceInNewTab } from '../config/microservices';

const MicroserviceNavigation = () => {
  const handleForumClick = () => {
    navigateToMicroservice('forum');
  };

  const handleFrontend2Click = () => {
    navigateToMicroservice('frontend_2');
  };

  const handleForumNewTab = () => {
    openMicroserviceInNewTab('forum');
  };

  const handleFrontend2NewTab = () => {
    openMicroserviceInNewTab('frontend_2');
  };

  return (
    <div className="microservice-navigation">
      <h3>Navigation vers les microservices</h3>
      <div className="nav-buttons">
        <button 
          onClick={handleForumClick}
          className="nav-button forum-button"
          title="Aller au Forum PVVIH"
        >
          🏛️ Forum PVVIH
        </button>
        
        <button 
          onClick={handleFrontend2Click}
          className="nav-button frontend2-button"
          title="Aller à Frontend-2"
        >
          🚀 Frontend-2
        </button>
      </div>
      
      <div className="nav-buttons-new-tab">
        <button 
          onClick={handleForumNewTab}
          className="nav-button-new-tab"
          title="Ouvrir le Forum dans un nouvel onglet"
        >
          🏛️ Forum (Nouvel onglet)
        </button>
        
        <button 
          onClick={handleFrontend2NewTab}
          className="nav-button-new-tab"
          title="Ouvrir Frontend-2 dans un nouvel onglet"
        >
          🚀 Frontend-2 (Nouvel onglet)
        </button>
      </div>
      
      <style jsx>{`
        .microservice-navigation {
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin: 20px 0;
          background-color: #f9f9f9;
        }
        
        .microservice-navigation h3 {
          margin-bottom: 15px;
          color: #333;
        }
        
        .nav-buttons, .nav-buttons-new-tab {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .nav-button, .nav-button-new-tab {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .nav-button {
          background-color: #007bff;
          color: white;
        }
        
        .nav-button:hover {
          background-color: #0056b3;
          transform: translateY(-2px);
        }
        
        .nav-button-new-tab {
          background-color: #28a745;
          color: white;
        }
        
        .nav-button-new-tab:hover {
          background-color: #1e7e34;
          transform: translateY(-2px);
        }
        
        .forum-button {
          background-color: #6f42c1;
        }
        
        .forum-button:hover {
          background-color: #5a32a3;
        }
        
        .frontend2-button {
          background-color: #fd7e14;
        }
        
        .frontend2-button:hover {
          background-color: #e55a00;
        }
      `}</style>
    </div>
  );
};

export default MicroserviceNavigation;





















