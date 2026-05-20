// ...existing code...
import React, { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import api from "../services/api";
import { getTranslation } from "../utils/translations";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import logo from "./im/feve_logo.png";
import { isJwtFormatValid, normalizeToken } from "../utils/tokenUtils";

const Login = () => {
  // ...existing code...
  const { login, logout, isAuthenticated } = useContext(AuthContext); // added logout
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedLang, setSelectedLang] = useState("fr");
  const [isLoading, setIsLoading] = useState(false);

  // use api instance baseURL (configured in src/services/api.js)
  const LOGIN_PATH = "/user-auth/login";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Nettoyer les anciens tokens avant de se connecter
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    try {
      console.log("Tentative de connexion vers :", (api.defaults.baseURL || "") + LOGIN_PATH);
      console.log("Données envoyées :", { username, password });
      
      const response = await api.post(
        LOGIN_PATH,
        { username, password },
        { withCredentials: true } // permettre cookies/sessions si nécessaire
      );

      console.log("Réponse reçue :", response.data);

      // accept several possible token shapes
      const rawToken =
        response?.data?.token ||
        response?.data?.accessToken ||
        response?.data?.data?.token;
      const token = normalizeToken(rawToken);

      if (!token || !isJwtFormatValid(token)) {
        console.error("Token manquant dans la réponse :", response.data);
        alert(getTranslation("login_failed", selectedLang) || "Nom d'utilisateur ou mot de passe incorrect");
        return;
      }

      const userData = { username };
      // persist token and user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("💾 Token sauvegardé dans localStorage");
      console.log("📌 Token value:", token);

      login(userData, token);
      console.log("✅ Context login appelé avec userData et token");
      navigate("/");
    } catch (error) {
      console.error("Erreur de connexion complète :", error);
      console.error("Erreur response :", error.response);
      console.error("Erreur data :", error.response?.data);
      console.error("Erreur status :", error.response?.status);
      console.error("Erreur headers :", error.response?.headers);
      
      let errorMessage = getTranslation("login_failed", selectedLang) || "Nom d'utilisateur ou mot de passe incorrect";
      
      if (error.response?.status === 403) {
        errorMessage = getTranslation("accessForbidden", selectedLang) || "Accès interdit - Vérifiez vos permissions";
      } else if (error.response?.status === 500) {
        errorMessage = getTranslation("serverError", selectedLang) || "Erreur serveur - Réessayez plus tard";
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = getTranslation("connectionError", selectedLang) || "Erreur de connexion - Vérifiez que le serveur est démarré";
      } else if (error.response?.data?.message?.includes('JWT expired')) {
        errorMessage = getTranslation("sessionExpired", selectedLang) || "Session expirée - Veuillez vous reconnecter";
        // Nettoyer le localStorage en cas d'erreur JWT
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      
      alert(errorMessage);
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
// ...existing code...