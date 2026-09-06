import React, { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import api from "../services/api";
import { getTranslation } from "../utils/translations";
import { useNavigate } from "react-router-dom";
import logo from "./im/feve_logo.png";
import SenegalFlag from "./im/sn.svg";
import GwFlag from "./im/gw.svg";
import GmFlag from "./im/gm.svg";
import { isJwtFormatValid, normalizeToken } from "../utils/tokenUtils";
import "./Login.css";

const Login = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
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

      // Sauvegarder le token temporairement pour faire l'appel API
      localStorage.setItem("token", token);
      console.log("💾 Token sauvegardé dans localStorage");
      console.log("📌 Token value:", token);

      // Récupérer les informations complètes de l'utilisateur
      try {
        console.log("📡 Récupération des infos utilisateur...");
        const userInfoResponse = await api.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("✅ Informations utilisateur récupérées:", userInfoResponse.data);

        // Normaliser les données pour supporter plusieurs formats d'API
        const apiUserData = userInfoResponse.data;
        const userData = {
          username: apiUserData.username || apiUserData.email || username,
          prenom: apiUserData.prenom || apiUserData.firstName || "",
          nom: apiUserData.nom || apiUserData.lastName || "",
          profil: apiUserData.profil || apiUserData.role || "",
          id: apiUserData.id || null,
        };

        console.log("🔄 Données utilisateur normalisées:", userData);

        // Persister les données complètes
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("💾 Données utilisateur sauvegardées dans localStorage");

        login(userData, token);
        console.log("✅ Context login appelé avec userData complet et token");
        navigate("/");
      } catch (userInfoError) {
        console.error("⚠️ Erreur lors de la récupération des infos utilisateur:", userInfoError);
        // En cas d'erreur, on continue avec les infos minimales
        const userData = { username };
        localStorage.setItem("user", JSON.stringify(userData));
        login(userData, token);
        navigate("/");
      }
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
      {/* Mini header pour la page de login : logo + sélecteur de langue uniquement */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <img
              src={logo}
              alt="Logo"
              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="flex items-center gap-2">
              {[
                { code: 'fr', icon: <img src={SenegalFlag} alt="FR" className="w-5 h-5" />, label: 'FR' },
                { code: 'en', icon: <img src={GmFlag} alt="EN" className="w-5 h-5" />, label: 'EN' },
                { code: 'pt', icon: <img src={GwFlag} alt="PT" className="w-5 h-5" />, label: 'PT' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                    selectedLang === lang.code
                      ? 'bg-white text-green-800 font-semibold'
                      : 'hover:bg-green-600'
                  }`}
                  type="button"
                >
                  {lang.icon}
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="login-content">
        <div className="login-card">
          {/* Section Gauche: Texte et Formulaire */}
          <div className="login-left">
            <h1 className="login-title">
              {getTranslation("platformTitle", selectedLang) ||
                "Plateforme de Référence et de Contre Référence Transfrontalière"}
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
              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading
                  ? "Connexion..."
                  : getTranslation("login", selectedLang) || "Se Connecter"}
              </button>

              <div className="form-footer">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.clear();
                    alert("Cache nettoyé !");
                  }}
                  className="cache-button"
                >
                  Nettoyer le cache
                </button>
              </div>
            </form>
          </div>

          {/* Section Droite: Logo FEVE */}
          <div className="login-right">
            <img src={logo} alt="Logo FEVE" className="login-logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;