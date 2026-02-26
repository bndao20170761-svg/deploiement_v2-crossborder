// src/components/Header.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import {
  ChevronDown,
  User,
  Globe,
  UserPlus,
  Users,
  Menu,
   Map,
  X,
  Stethoscope,
  Building,
  UsersIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getTranslation } from "../utils/translations";
import { AuthContext } from "./AuthContext";
import SenegalFlag from "./im/sn.svg";
import GwFlag from "./im/gw.svg";
import GmFlag from "./im/gm.svg";
import logo from "../../im/feve_logo.jpg";

const Header = ({
  onMenuSelect = () => {},
  language = "fr",
  onLanguageChange = () => {},
  patientCount = 0,
  doctorCount = 0,
  memberCount = 0,
  associationCount = 0,
  hospitalCount = 0,
  assistantCount = 0,
  onCartographyToggle = () => {},
}) => {
  const [isPatientOpen, setIsPatientOpen] = useState(false);
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [isAssociationOpen, setIsAssociationOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isHospitalOpen, setIsHospitalOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isDoctorMenuOpen, setIsDoctorMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [doctor, setDoctor] = useState({});

  const patientDropdownRef = useRef(null);
  const doctorDropdownRef = useRef(null);
  const memberDropdownRef = useRef(null);
  const assistantDropdownRef = useRef(null);
  const associationDropdownRef = useRef(null);
  const hospitalDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
          `${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/user-auth/me`,
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
      if (isMobileMenuOpen) {
        // Si le menu mobile est ouvert, ne fermer que le menu mobile si clic à l'extérieur
        if (
          mobileMenuRef.current &&
          !mobileMenuRef.current.contains(event.target) &&
          !event.target.closest('button[aria-label="Menu mobile"]')
        ) {
          setIsMobileMenuOpen(false);
          closeAllMobileSubmenus();
        }
        return; // Ne pas fermer les sous-menus mobiles individuellement
      }
      // Gestion desktop (fermer les sous-menus si clic à l'extérieur)
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target)) setIsPatientOpen(false);
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(event.target)) setIsDoctorOpen(false);
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target)) setIsMemberOpen(false);
      if (assistantDropdownRef.current && !assistantDropdownRef.current.contains(event.target)) setIsAssistantOpen(false);
      if (associationDropdownRef.current && !associationDropdownRef.current.contains(event.target)) setIsAssociationOpen(false);
      if (hospitalDropdownRef.current && !hospitalDropdownRef.current.contains(event.target)) setIsHospitalOpen(false);
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) setIsLanguageOpen(false);
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) setIsDoctorMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsPatientOpen(false);
        setIsDoctorOpen(false);
        setIsMemberOpen(false);
        setIsAssistantOpen(false);
        setIsAssociationOpen(false);
        setIsHospitalOpen(false);
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
  }, [isMobileMenuOpen]);


  const handleMenuItemClick = (menu) => {
    console.log('Menu item clicked:', menu);
    onMenuSelect(menu);

    // Fermer tous les menus
    setIsPatientOpen(false);
    setIsDoctorOpen(false);
    setIsMemberOpen(false);
    setIsAssistantOpen(false);
    setIsAssociationOpen(false);
    setIsHospitalOpen(false);
    setIsLanguageOpen(false);
    setIsMobileMenuOpen(false);
  };

  const [currentLang, setCurrentLang] = useState(language);
  const handleLanguageSelect = (lang) => {
    setCurrentLang(lang);
    onLanguageChange(lang);
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

  // Fonction pour fermer tous les sous-menus mobiles
  const closeAllMobileSubmenus = () => {
    setIsPatientOpen(false);
    setIsDoctorOpen(false);
    setIsMemberOpen(false);
    setIsAssistantOpen(false);
    setIsAssociationOpen(false);
    setIsHospitalOpen(false);
    setIsLanguageOpen(false);
  };

  // Fonction pour basculler les sous-menus mobiles
  const toggleMobileSubmenu = (menuType) => {
    closeAllMobileSubmenus();
    switch(menuType) {
      case 'patient':
        setIsPatientOpen(!isPatientOpen);
        break;
      case 'doctor':
        setIsDoctorOpen(!isDoctorOpen);
        break;
      case 'member':
        setIsMemberOpen(!isMemberOpen);
        break;
      case 'assistant':
        setIsAssistantOpen(!isAssistantOpen);
        break;
      case 'association':
        setIsAssociationOpen(!isAssociationOpen);
        break;
      case 'hospital':
        setIsHospitalOpen(!isHospitalOpen);
        break;
      case 'language':
        setIsLanguageOpen(!isLanguageOpen);
        break;
      default:
        break;
    }
  };

  // Composant pour les menus déroulants desktop
  const DesktopDropdown = ({ title, translationKey, icon: Icon, isOpen, setIsOpen, dropdownRef, children }) => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 xl:px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
        type="button"
      >
        {Icon && <Icon className="h-4 w-4 mr-1" />}
        <span className="hidden xl:inline">{getTranslation(translationKey, language)}</span>
        <span className="xl:hidden">{title}</span>
        <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );

  // Composant pour les éléments de menu
  const MenuItem = ({ onClick, icon: Icon, text, count, countColor = "green" }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
      type="button"
    >
      <div className="flex items-center">
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        <span>{text}</span>
      </div>
      {count !== undefined && (
        <span className={`bg-${countColor}-500 text-white text-xs rounded-full px-2 py-0.5`}>
          {count}
        </span>
      )}
    </button>
  );

  // Composant pour les sous-menus mobiles
  const MobileSubmenu = ({ title, translationKey, icon: Icon, isOpen, onToggle, children }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 rounded-md text-white hover:bg-green-700 transition-colors"
        type="button"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <Icon className="h-4 w-4 mr-2" />
          <span>{getTranslation(translationKey, language)}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="mt-1 ml-4 bg-green-700 rounded-md">
          {children}
        </div>
      )}
    </div>
  );
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
            {/* Menu Patient */}
            <DesktopDropdown
              title="Patients"
              translationKey="patient"
              icon={Users}
              isOpen={isPatientOpen}
              setIsOpen={setIsPatientOpen}
              dropdownRef={patientDropdownRef}
            >
              <MenuItem
                onClick={() => handleMenuItemClick('addPatient')}
                icon={UserPlus}
                text={getTranslation('addPatient', language)}
              />
              <MenuItem
                onClick={() => handleMenuItemClick('patientList')}
                icon={Users}
                text={getTranslation('patientList', language)}
                count={patientCount}
                countColor="green"
              />
            </DesktopDropdown>

            {/* Menu Doctor */}
            <DesktopDropdown
              title="Doctors"
              translationKey="doctor"
              icon={Stethoscope}
              isOpen={isDoctorOpen}
              setIsOpen={setIsDoctorOpen}
              dropdownRef={doctorDropdownRef}
            >
              <MenuItem
                onClick={() => handleMenuItemClick('addDoctor')}
                icon={UserPlus}
                text={getTranslation('addDoctor', language)}
              />
              <MenuItem
                onClick={() => handleMenuItemClick('doctorList')}
                icon={Users}
                text={getTranslation('doctorList', language)}
                count={doctorCount}
                countColor="blue"
              />
            </DesktopDropdown>

            {/* Menu Assistant Social */}
            <DesktopDropdown
              title="Assistants"
              translationKey="assistant"
              icon={UsersIcon}
              isOpen={isAssistantOpen}
              setIsOpen={setIsAssistantOpen}
              dropdownRef={assistantDropdownRef}
            >
              <MenuItem
                onClick={() => handleMenuItemClick('addAssistant')}
                icon={UserPlus}
                text={getTranslation('addAssistant', language)}
              />
              <MenuItem
                onClick={() => handleMenuItemClick('assistantList')}
                icon={Users}
                text={getTranslation('assistantList', language)}
                count={assistantCount}
                countColor="teal"
              />
            </DesktopDropdown>

            {/* Menu Membre */}
            <DesktopDropdown
              title="Members"
              translationKey="member"
              icon={UsersIcon}
              isOpen={isMemberOpen}
              setIsOpen={setIsMemberOpen}
              dropdownRef={memberDropdownRef}
            >
              <MenuItem
                onClick={() => handleMenuItemClick('addMember')}
                icon={UserPlus}
                text={getTranslation('addMember', language)}
              />
              <MenuItem
                onClick={() => handleMenuItemClick('memberList')}
                icon={Users}
                text={getTranslation('memberList', language)}
                count={memberCount}
                countColor="purple"
              />
              <MenuItem
                              onClick={() => handleMenuItemClick('addAssociation')}
                              icon={UserPlus}
                              text={getTranslation('addAssociation', language)}
                            />

              <MenuItem
                             onClick={() => handleMenuItemClick('associationList')}
                             icon={Users}
                             text={getTranslation('associationList', language)}
                             count={associationCount}
                             countColor="yellow"
                           />
            </DesktopDropdown>



            {/* Menu Hôpital */}
            <DesktopDropdown
              title="Hospitals"
              translationKey="hospital"
              icon={Building}
              isOpen={isHospitalOpen}
              setIsOpen={setIsHospitalOpen}
              dropdownRef={hospitalDropdownRef}
            >
              <MenuItem
                onClick={() => handleMenuItemClick('addHospital')}
                icon={UserPlus}
                text={getTranslation('addHospital', language)}
              />
              <MenuItem
                onClick={() => handleMenuItemClick('hospitalList')}
                icon={Users}
                text={getTranslation('hospitalList', language)}
                count={hospitalCount}
                countColor="red"
              />
            </DesktopDropdown>

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
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsDoctorMenuOpen(!isDoctorMenuOpen)}
                className="flex items-center px-2 lg:px-3 py-2 rounded-md hover:bg-green-600 text-sm"
                type="button"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">
                  {doctor ? `  ${doctor.prenom}  ${doctor.profil}  ${doctor.nom} ` : 'Médecin'}
                </span>
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isDoctorMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDoctorMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b md:hidden">
                      {doctor ? `Dr: ${doctor.prenom} ${doctor.nom}` : 'Médecin'}
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
                aria-label="Menu mobile"
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
              {/* Menu Patient Mobile */}
              <MobileSubmenu
                title={getTranslation('patient', language)}
                translationKey="patient"
                icon={Users}
                isOpen={isPatientOpen}
                onToggle={() => toggleMobileSubmenu('patient')}
              >
                <button
                  onClick={() => handleMenuItemClick('addPatient')}
                  className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-green-600 rounded-md"
                  type="button"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {getTranslation('addPatient', language)}
                </button>
                <button
                  onClick={() => handleMenuItemClick('patientList')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-green-600 rounded-md"
                  type="button"
                >
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{getTranslation('patientList', language)}</span>
                  </div>
                  <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">{patientCount}</span>
                </button>
              </MobileSubmenu>

              {/* Menu Doctor Mobile */}
              <MobileSubmenu
                title={getTranslation('doctor', language)}
                translationKey="doctor"
                icon={Stethoscope}
                isOpen={isDoctorOpen}
                onToggle={() => toggleMobileSubmenu('doctor')}
              >
                <button
                  onClick={() => handleMenuItemClick('addDoctor')}
                  className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-green-600 rounded-md"
                  type="button"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {getTranslation('addDoctor', language)}
                </button>
                <button
                  onClick={() => handleMenuItemClick('doctorList')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-green-600 rounded-md"
                  type="button"
                >
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{getTranslation('doctorList', language)}</span>
                  </div>
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{doctorCount}</span>
                </button>
              </MobileSubmenu>

              {/* Menu Assistant Mobile */}
              <MobileSubmenu
                title={getTranslation('assistant', language)}
                translationKey="assistant"
                icon={UsersIcon}
                isOpen={isAssistantOpen}
                onToggle={() => toggleMobileSubmenu('assistant')}
              >
                <button
                  onClick={() => handleMenuItemClick('addAssistant')}
                  className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-green-600 rounded-md"
                  type="button"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {getTranslation('addAssistant', language)}
                </button>
                <button
                  onClick={() => handleMenuItemClick('assistantList')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-green-600 rounded-md"
                  type="button"
                >
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{getTranslation('assistantList', language)}</span>
                  </div>
                  <span className="bg-teal-500 text-white text-xs rounded-full px-2 py-0.5">{assistantCount}</span>
                </button>
              </MobileSubmenu>

              {/* Menu Membre Mobile */}
              <MobileSubmenu
                title={getTranslation('member', language)}
                translationKey="member"
                icon={UsersIcon}
                isOpen={isMemberOpen}
                onToggle={() => toggleMobileSubmenu('member')}
              >
                <button
                  onClick={() => handleMenuItemClick('addMember')}
                  className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-green-600 rounded-md"
                  type="button"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {getTranslation('addMember', language)}
                </button>
                <button
                  onClick={() => handleMenuItemClick('memberList')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-green-600 rounded-md"
                  type="button"
                >
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{getTranslation('memberList', language)}</span>
                  </div>
                  <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5">{memberCount}</span>
                </button>
              </MobileSubmenu>

              {/* Menu Association Mobile */}
              <MobileSubmenu
                title={getTranslation('association', language)}
                translationKey="association"
                icon={Building}
                isOpen={isAssociationOpen}
                onToggle={() => toggleMobileSubmenu('association')}
              >
                <button
                  onClick={() => handleMenuItemClick('addAssociation')}
                  className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-green-600 rounded-md"
                  type="button"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {getTranslation('addAssociation', language)}
                </button>
                <button
                  onClick={() => handleMenuItemClick('associationList')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-green-600 rounded-md"
                  type="button"
                >
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{getTranslation('associationList', language)}</span>
                  </div>
                  <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">{associationCount}</span>
                </button>
              </MobileSubmenu>

              {/* Menu Hôpital Mobile */}
              <MobileSubmenu
                title={getTranslation('hospital', language)}
                translationKey="hospital"
                icon={Building}
                isOpen={isHospitalOpen}
                onToggle={() => toggleMobileSubmenu('hospital')}
              >
                <button
                  onClick={() => handleMenuItemClick('addHospital')}
                  className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-green-600 rounded-md"
                  type="button"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {getTranslation('addHospital', language)}
                </button>
                <button
                  onClick={() => handleMenuItemClick('hospitalList')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-green-600 rounded-md"
                  type="button"
                >
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{getTranslation('hospitalList', language)}</span>
                  </div>
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{hospitalCount}</span>
                </button>
              </MobileSubmenu>

              {/* Menu Langues Mobile */}
              <MobileSubmenu
                title={getTranslation('languages', language)}
                translationKey="languages"
                icon={Globe}
                isOpen={isLanguageOpen}
                onToggle={() => toggleMobileSubmenu('language')}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors ${
                      language === lang.code
                        ? "bg-green-600 text-white font-medium"
                        : "text-white hover:bg-green-600"
                    }`}
                    type="button"
                  >
                    {lang.icon}
                    <span className="ml-2">{lang.label}</span>
                  </button>
                ))}
              </MobileSubmenu>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;