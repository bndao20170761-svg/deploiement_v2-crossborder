import React, { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import { getTranslation } from "../utils/translations";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "./LanguageSelector"; // 👈 ton composant avec drapeaux
import logo from "../../im/feve_logo.jpg";

const Login = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedLang, setSelectedLang] = useState("fr");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmedUsername = (username || "").trim();
    const trimmedPassword = (password || "").trim();
    if (!trimmedUsername || !trimmedPassword) {
      alert("Veuillez remplir l'email et le mot de passe.");
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/user-auth/login`, {
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
    }
  };

  const handleMenuSelect = (option) => {
    setMenuOpen(false);
    if (option === "register") navigate("/register");
    else if (option === "logout") {
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
        <LanguageSelector
          selectedLang={selectedLang}
          onChange={setSelectedLang}
        />

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
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
            >
              {getTranslation("login", selectedLang) || "Connexion"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
