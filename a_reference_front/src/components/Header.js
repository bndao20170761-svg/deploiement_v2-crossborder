// src/components/Header.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import {
  ChevronDown,
  User,
  Globe,
  MessageSquare,
  Map,
  UserPlus,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getTranslation } from "../utils/translations";
import { AuthContext } from "./AuthContext";
import { navigateToMicroservice } from "../config/microservices";
import SenegalFlag from "./im/sn.svg";
import GwFlag from "./im/gw.svg";
import GmFlag from "./im/gm.svg";
import logo from "../im/feve_logo.jpg";

const Header = ({
  onMenuSelect = () => {},
  sentCountAssist = 0,
  sentCount = 0,
  receivedCount = 0,
  language = "fr",
  onLanguageChange = () => {},
  patientCount = 0,

    // Nouvelle prop pour gérer l'état de la cartographie
   onCartographyToggle = () => {},
}) => {
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [isAutoReferenceOpen, setIsAutoReferenceOpen] = useState(false);
  const [isPatientOpen, setIsPatientOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isDoctorMenuOpen, setIsDoctorMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [doctor, setDoctor] = useState({});

  const dropdownRef = useRef(null);
  const autoDropdownRef = useRef(null);
  const patientDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const doctorDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  //cartographie
   const [isCartographyActive, setIsCartographyActive] = useState(false);

    const handleCartographyClick = () => {
      const newState = !isCartographyActive;
      setIsCartographyActive(newState);
        // Notifier le composant parent
            onCartographyToggle(newState);

            // Si vous voulez aussi utiliser le système de menu existant
            handleMenuItemClick('cartography');
          };


  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // redirection après logout
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/user-auth/me`,
          getAuthHeader()
        );
        setDoctor(response.data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du médecin :", error);
      }
    };
    fetchDoctor();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsReferenceOpen(false);
      if (autoDropdownRef.current && !autoDropdownRef.current.contains(event.target)) setIsAutoReferenceOpen(false);
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target)) setIsPatientOpen(false);
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) setIsLanguageOpen(false);
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(event.target)) setIsDoctorMenuOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) setIsMobileMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsReferenceOpen(false);
        setIsAutoReferenceOpen(false);
        setIsPatientOpen(false);
        setIsLanguageOpen(false);
        setIsDoctorMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleMenuItemClick = (menu) => {
    console.log('Menu item clicked:', menu);
    onMenuSelect(menu);
    // Fermer tous les menus
    setIsReferenceOpen(false);
    setIsAutoReferenceOpen(false);
    setIsPatientOpen(false);
    setIsLanguageOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Fonction pour naviguer vers le forum
  const handleForumClick = () => {
    console.log('Navigation vers le Forum PVVIH...');
    navigateToMicroservice('FORUM');
  };

const [currentLang, setCurrentLang] = useState(language);
 const handleLanguageSelect = (lang) => {
   setCurrentLang(lang); // ⚡ mettre à jour localement
   onLanguageChange(lang); // ⚡ prévenir le parent si nécessaire
   setIsLanguageOpen(false);
   setIsMobileMenuOpen(false);
 };

  const languages = [
    { code: 'fr', label: getTranslation('french', language), icon: <img src={SenegalFlag} alt="SN" className="w-5 h-5" /> },
    { code: 'en', label: getTranslation('english', language) ,icon: <img src={GmFlag} alt="GM" className="w-5 h-5" /> },
    { code: 'pt', label: getTranslation('portuguese', language) ,icon: <img src={GwFlag} alt="GM" className="w-5 h-5" /> },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
 const currentLanguage = languages.find(lang => lang.code === language) || languages[0];
  return (
    <header className="bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md mr-2"
            />
          </div>

          {/* Navigation Desktop */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1 lg:flex-1">

          {/* Bouton Accueil */}
          <button
            onClick={() => handleMenuItemClick('home')}
            className="flex items-center px-3 xl:px-4 py-2 rounded-md hover:bg-green-600 text-sm font-medium"
            type="button"
          >
            <span className="hidden xl:inline">{getTranslation('home', language)}</span>
            <span className="xl:hidden">Accueil</span>
          </button>
            {/* Menu Références */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsReferenceOpen(!isReferenceOpen)}
                className="flex items-center px-3 xl:px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                type="button"
              >
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 mr-2">
                  {receivedCount }
                </span>
                <span className="hidden xl:inline">{getTranslation('reference', language)}</span>
                <span className="xl:hidden">Ref</span>
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isReferenceOpen ? 'rotate-180' : ''}`} />
              </button>
              {isReferenceOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => handleMenuItemClick('add')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                      type="button"
                    >
                      ➕{getTranslation('addReference', language)}
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('sent')}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                      type="button"
                    >
                      <span>{getTranslation('sentReference', language)}</span>
                      <div className="flex space-x-1">
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{sentCount}</span>
                        <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">{sentCountAssist}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('received')}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                      type="button"
                    >
                      <span>{getTranslation('receivedReference', language)}</span>
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{receivedCount}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Auto-Références */}
            <div className="relative" ref={autoDropdownRef}>
              <button
                onClick={() => setIsAutoReferenceOpen(!isAutoReferenceOpen)}
                className="flex items-center px-3 xl:px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                type="button"
              >
                <span className="bg-purple-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 mr-2">
                  {receivedCount}
                </span>
                <span className="hidden xl:inline">{getTranslation("autoReference", language)}</span>
                <span className="xl:hidden">Auto</span>
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isAutoReferenceOpen ? "rotate-180" : ""}`} />
              </button>

              {isAutoReferenceOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg z-50 border border-gray-200 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => handleMenuItemClick("autoAdd")}
                      className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800 transition-colors"
                      type="button"
                    >
                      ➕ {getTranslation("addAutoReference", language)}
                    </button>
                    <button
                      onClick={() => handleMenuItemClick("autoSent")}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-800 transition-colors"
                      type="button"
                    >
                      <span>{getTranslation("sentAutoReference", language)}</span>
                      <span className="bg-blue-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                        {sentCount}
                      </span>
                    </button>
                    <button
                      onClick={() => handleMenuItemClick("autoReceived")}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-800 transition-colors"
                      type="button"
                    >
                      <span>{getTranslation("receivedAutoReference", language)}</span>
                      <span className="bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                        {receivedCount}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Patient */}
            <div className="relative" ref={patientDropdownRef}>
              <button
                onClick={() => setIsPatientOpen(!isPatientOpen)}
                className="flex items-center px-3 xl:px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                type="button"
              >
                <span className="hidden xl:inline">{getTranslation('patient', language)}</span>
                <span className="xl:hidden">Patients</span>
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isPatientOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPatientOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => handleMenuItemClick('addPatient')}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                      type="button"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {getTranslation('addPatient', language)}
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('patientList')}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                      type="button"
                    >
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{getTranslation('patientList', language)}</span>
                      </div>
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">{patientCount}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Autres boutons */}
            <button
               onClick={handleCartographyClick}
               className={`flex items-center px-3 xl:px-4 py-2 rounded-md hover:bg-green-600 text-sm ${
                 isCartographyActive ? 'bg-green-600 border-2 border-white' : ''
               }`}
               type="button"
             >
               <Map className="h-4 w-4 mr-1" />
               <span className="hidden xl:inline">{getTranslation('cartography', language)}</span>
               <span className="xl:hidden">Carte</span>
               {isCartographyActive && (
                 <span className="ml-2 bg-white text-green-600 text-xs rounded-full px-2 py-0.5">
                   ●
                 </span>
               )}
             </button>

            <button
              onClick={handleForumClick}
              className="flex items-center px-3 xl:px-4 py-2 rounded-md hover:bg-green-600 text-sm font-medium transition-colors duration-200"
              type="button"
              title="Aller au Forum PVVIH (Port 3000)"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="hidden xl:inline">{getTranslation('forum', language)}</span>
              <span className="xl:hidden">Forum</span>
            </button>

            {/* Menu Langues - CORRIGÉ */}
                      <div className="relative" ref={languageDropdownRef}>
                        <button
                          onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                          className="flex items-center px-3 xl:px-4 py-2 rounded-md hover:bg-green-600 text-sm font-medium"
                          type="button"
                        >
                          {/* Afficher le drapeau de la langue actuelle */}
                          {currentLanguage.icon}
                          <span className="hidden xl:inline ml-2">{getTranslation('languages', language)}</span>
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isLanguageOpen && (
                          <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                            <div className="py-1">
                              {languages.map((lang) => (
                                <button
                                  key={lang.code}
                                  onClick={() => handleLanguageSelect(lang.code)}
                                  className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                                    language === lang.code
                                      ? "bg-green-600 text-white font-medium"
                                      : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                                  }`}
                                  type="button"
                                >
                                  {lang.icon}
                                  {lang.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
          {/* Menu utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Profil Médecin avec Déconnexion */}
            <div className="relative" ref={doctorDropdownRef}>
              <button
                onClick={() => setIsDoctorMenuOpen(!isDoctorMenuOpen)}
                className="flex items-center px-2 lg:px-3 py-2 rounded-md hover:bg-green-600 text-sm"
                type="button"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">
                  {doctor ? ` ${doctor.prenom} ${doctor.nom}` : 'Médecin'}
                </span>
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isDoctorMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDoctorMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b md:hidden">
                      {doctor ? `${doctor.prenom} ${doctor.nom}` : 'Médecin'}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-700"
                      type="button"
                    >
                      {getTranslation('logout', language)}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger Menu pour Mobile/Tablet */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md hover:bg-green-600 transition-colors"
                type="button"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Menu Mobile/Tablet */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-green-600 bg-green-800" ref={mobileMenuRef}>
            <div className="px-2 pt-2 pb-3 space-y-1">

             {/* Section Références (Desktop / Tablet) */}
             <div className="relative" ref={dropdownRef}>
               <button
                 onClick={() => setIsReferenceOpen(!isReferenceOpen)}
                 className="flex items-center px-3 xl:px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                 type="button"
               >
                 {/* Badge total */}
                 <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 mr-2">
                   {receivedCount }
                 </span>

                 {/* Label */}
                 <span className="hidden xl:inline">{getTranslation('reference', language)}</span>
                 <span className="xl:hidden">Ref</span>

                 {/* Chevron */}
                 <ChevronDown
                   className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                     isReferenceOpen ? 'rotate-180' : ''
                   }`}
                 />
               </button>

               {/* Dropdown */}
               {isReferenceOpen && (
                 <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                   <div className="py-1">
                     <button
                       onClick={() => handleMenuItemClick('add')}
                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                       type="button"
                     >
                       ➕ {getTranslation('addReference', language)}
                     </button>

                     <button
                       onClick={() => handleMenuItemClick('sent')}
                       className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                       type="button"
                     >
                       <span>{getTranslation('sentReference', language)}</span>
                       <div className="flex space-x-1">
                         <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                           {sentCount}
                         </span>
                         <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
                           {sentCountAssist}
                         </span>
                       </div>
                     </button>

                     <button
                       onClick={() => handleMenuItemClick('received')}
                       className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                       type="button"
                     >
                       <span>{getTranslation('receivedReference', language)}</span>
                       <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                         {receivedCount}
                       </span>
                     </button>
                   </div>
                 </div>
               )}
             </div>

            {/* Section Auto-Références (Desktop / Tablet) */}
            <div className="relative" ref={autoDropdownRef}>
              <button
                onClick={() => setIsAutoReferenceOpen(!isAutoReferenceOpen)}
                className="flex items-center px-3 xl:px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                type="button"
              >
                {/* Badge total */}
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 mr-2">
                  {sentCount + receivedCount}
                </span>

                {/* Label */}
                <span className="hidden xl:inline">{getTranslation("autoReference", language)}</span>
                <span className="xl:hidden">AutoRef</span>

                {/* Chevron */}
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                    isAutoReferenceOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown */}
              {isAutoReferenceOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => handleMenuItemClick("autoAdd")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                      type="button"
                    >
                      ➕ {getTranslation("addAutoReference", language)}
                    </button>

                    <button
                      onClick={() => handleMenuItemClick("autoSent")}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                      type="button"
                    >
                      <span>{getTranslation("sentAutoReference", language)}</span>
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                        {sentCount}
                      </span>
                    </button>

                    <button
                      onClick={() => handleMenuItemClick("autoReceived")}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                      type="button"
                    >
                      <span>{getTranslation("receivedAutoReference", language)}</span>
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {receivedCount}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Section Patients (Desktop / Tablet) */}
            <div className="relative" ref={patientDropdownRef}>
              <button
                onClick={() => setIsPatientOpen(!isPatientOpen)}
                className="flex items-center px-3 xl:px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                type="button"
              >
                {/* Badge total patients */}
                <span className="bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 mr-2">
                  {patientCount}
                </span>

                {/* Label */}
                <span className="hidden xl:inline">{getTranslation('patient', language)}</span>
                <span className="xl:hidden">Patients</span>

                {/* Chevron */}
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                    isPatientOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown */}
              {isPatientOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => handleMenuItemClick('addPatient')}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                      type="button"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {getTranslation('addPatient', language)}
                    </button>

                    <button
                      onClick={() => handleMenuItemClick('patientList')}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                      type="button"
                    >
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{getTranslation('patientList', language)}</span>
                      </div>
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                        {patientCount}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

              {/* Autres options */}
              <button
                onClick={() => handleMenuItemClick('cartography')}
                className="flex items-center w-full px-3 py-2 rounded-md text-white hover:bg-green-700 transition-colors"
                type="button"
              >
                <Map className="h-4 w-4 mr-2" />
                {getTranslation('cartography', language)}
              </button>
              <button
                onClick={handleForumClick}
                className="flex items-center w-full px-3 py-2 rounded-md text-white hover:bg-green-700 transition-colors"
                type="button"
                title="Aller au Forum PVVIH (Port 3000)"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {getTranslation('forum', language)}
              </button>

              {/* Section Langues (Desktop / Tablet) */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center px-3 xl:px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                  type="button"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span className="hidden xl:inline">{getTranslation('languages', language)}</span>
                  <span className="xl:hidden">Lang</span>
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                      isLanguageOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isLanguageOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="py-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageSelect(lang.code)}
                          className={`block w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                            language === lang.code
                              ? 'bg-green-600 text-white font-medium'
                              : 'text-gray-700 hover:bg-green-50 hover:text-green-800'
                          }`}
                          type="button"
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;