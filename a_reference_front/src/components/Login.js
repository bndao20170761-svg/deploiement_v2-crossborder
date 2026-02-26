// ...existing code...
import React, { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import api from "../services/api";
import { getTranslation } from "../utils/translations";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import logo from "../im/feve_logo.jpg";

const Login = () => {
  // ...existing code...
  const { login, logout, isAuthenticated } = useContext(AuthContext); // added logout
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedLang, setSelectedLang] = useState("fr");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // use api instance baseURL (configured in src/services/api.js)
  const LOGIN_PATH = "/api/user-auth/login";

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
      const token =
        response?.data?.token ||
        response?.data?.accessToken ||
        response?.data?.data?.token;

      if (!token) {
        console.error("Token manquant dans la réponse :", response.data);
        alert(getTranslation("login_failed", selectedLang) || "Nom d'utilisateur ou mot de passe incorrect");
        return;
      }

      const userData = { username };
      // persist token and user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      login(userData, token);
      navigate("/");
    } catch (error) {
      console.error("Erreur de connexion complète :", error);
      console.error("Erreur response :", error.response);
      console.error("Erreur data :", error.response?.data);
      console.error("Erreur status :", error.response?.status);
      console.error("Erreur headers :", error.response?.headers);
      
      let errorMessage = getTranslation("login_failed", selectedLang) || "Nom d'utilisateur ou mot de passe incorrect";
      
      if (error.response?.status === 403) {
        errorMessage = "Accès interdit - Vérifiez vos permissions";
      } else if (error.response?.status === 500) {
        errorMessage = "Erreur serveur - Réessayez plus tard";
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = "Erreur de connexion - Vérifiez que le serveur est démarré";
      } else if (error.response?.data?.message?.includes('JWT expired')) {
        errorMessage = "Session expirée - Veuillez vous reconnecter";
        // Nettoyer le localStorage en cas d'erreur JWT
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuSelect = (option) => {
    setMenuOpen(false);
    if (option === "register") navigate("/register");
    else if (option === "logout") {
      // use context logout if available and clear storage
      try {
        logout && logout();
      } catch (err) {
        console.warn("logout context error:", err);
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-100"
      style={{
        backgroundImage: `url(${logo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Barre de menu verte */}
      <div className="flex justify-end items-center bg-gradient-to-r from-green-800 to-green-700 text-white p-4 shadow">

        {/* Sélecteur de langue avec drapeaux */}
        <span className="bg-white text-green-800 px-4 py-1 rounded hover:bg-green-100">
          <LanguageSelector
            selectedLang={selectedLang}
            onChange={setSelectedLang}
          />
        </span>

        {/* Menu compte */}
        <div className="relative ml-4">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-white text-green-800 px-4 py-1 rounded hover:bg-green-100"
          >
            {getTranslation("account", selectedLang) || "Compte"}
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow-md z-10 text-gray-700">
              <ul className="text-sm">
                {!isAuthenticated && (
                  <li>
                    <button
                      onClick={() => handleMenuSelect("register")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {getTranslation("register", selectedLang) || "Inscription"}
                    </button>
                  </li>
                )}
                {isAuthenticated && (
                  <li>
                    <button
                      onClick={() => handleMenuSelect("logout")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {getTranslation("logout", selectedLang) || "Déconnexion"}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire de connexion */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white/95 p-8 rounded shadow-md w-full max-w-sm">
          {/* Logo en haut du formulaire */}
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="Logo"
              className="h-20 w-20 object-contain rounded-full shadow-md bg-white"
            />
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
            {getTranslation("login", selectedLang) || "Connexion"}
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                {getTranslation("email", selectedLang) || "Email"}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500"
                disabled={isLoading}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                {getTranslation("password", selectedLang) || "Mot de passe"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : (getTranslation("login", selectedLang) || "Connexion")}
            </button>
            
            {/* Bouton de nettoyage pour les tests */}
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                alert("localStorage nettoyé !");
              }}
              className="w-full mt-2 bg-gray-500 text-white py-1 rounded hover:bg-gray-600 transition text-sm"
            >
              Nettoyer le cache
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
// ...existing code...