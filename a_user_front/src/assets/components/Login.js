import React, { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import { getTranslation } from "../utils/translations";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import logo from "../../im/feve_logo.png";
import "./Login.css";

const Login = () => {
  const { login, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedLang, setSelectedLang] = useState("fr");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const trimmedUsername = (username || "").trim();
    const trimmedPassword = (password || "").trim();
    if (!trimmedUsername || !trimmedPassword) {
      setIsLoading(false);
      alert("Veuillez remplir l'email et le mot de passe.");
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_GATEWAY_URL || 'http://13.53.133.40:8080'}/api/user-auth/login`, {
        username: trimmedUsername,
        password: trimmedPassword,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      // Accepter plusieurs formats de token possibles
      const token = 
        response?.data?.token ||
        response?.data?.accessToken ||
        response?.data?.data?.token;

      if (!token) {
        console.error("Token manquant dans la réponse :", response.data);
        alert("Nom d'utilisateur ou mot de passe incorrect");
        return;
      }

      const userData = { username: trimmedUsername };
      login(userData, token);
      navigate("/");
    } catch (error) {
      console.error("Erreur de connexion :", error.response?.data || error.message);
      alert("Nom d'utilisateur ou mot de passe incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Header component integration */}
      <Header 
        language={selectedLang} 
        onLanguageChange={setSelectedLang} 
        onMenuSelect={(menu) => menu === 'register' && navigate('/register')}
      />

      {/* Formulaire de connexion */}
      <div className="login-content">
        <div className="login-card">
          {/* Section Gauche: Texte et Formulaire */}
          <div className="login-left">
            <h1 className="login-title">
              {getTranslation("platformTitle", selectedLang) || "Plateforme de Référence et de Contre Référence Transfrontalière"}
            </h1>
            <h2 className="login-subtitle">
              {getTranslation("login", selectedLang) || "Connexion"}
            </h2>
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label className="form-label">
                  {getTranslation("email", selectedLang) || "Email"}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  disabled={isLoading}
                  placeholder="votre@email.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {getTranslation("password", selectedLang) || "Mot de passe"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  disabled={isLoading}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : (getTranslation("login", selectedLang) || "Se Connecter")}
              </button>
              
              <div className="form-footer">
                <button
                  type="button"
                  onClick={() => { localStorage.clear(); alert("Cache nettoyé !"); }}
                  className="cache-button"
                >
                  Nettoyer le cache
                </button>
              </div>
            </form>
          </div>

          {/* Section Droite: Logo FEVE */}
          <div className="login-right">
            <img
              src={logo}
              alt="Logo FEVE"
              className="login-logo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
