import DossierView from "./DossierView";

import React, { useState, useEffect, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";
import  { ArrowLeft, ArrowRight, Camera, Eye, Video, Circle } from "lucide-react";
import axios from "axios";
import { getTranslation } from '../utils/translations';


function Utils(errorOutputId) {
    this.createFileFromUrl = function(path, url, callback) {
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function(ev) {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    let data = new Uint8Array(request.response);
                    cv.FS_createDataFile('/', path, data, true, false, false);
                    callback();
                } else {
                    console.error('Failed to load ' + url + ' status: ' + request.status);
                }
            }
        };
        request.send();
    };

    // Pour mesurer le FPS si besoin
    var lastFrameStartTime = performance.now();
    var fpsData = { fps: 0 };
    function fpsMeasure(now){
        fpsData.fps = 1000 / (now - lastFrameStartTime);
        lastFrameStartTime = now;
        requestAnimationFrame(fpsMeasure);
    }
    this.initFPSMeasure = function (){
        lastFrameStartTime = performance.now();
        requestAnimationFrame(fpsMeasure);
        return fpsData;
    };
}

export default function FormulaireMultiEtapes({onSuccess,language ,codePatient,initialData } ) {

 // Clé unique pour le stockage basée sur le codePatient
  const storageKey = `formulaireDossier_${codePatient || 'new'}`;

  // État initial avec restauration depuis localStorage
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          donneesFormulaire: parsed.donneesFormulaire || {},
          contacts: parsed.contacts || [{ nom: "", type: "", age: "", sexe: "", statut: "", resultat: "", soins: "", id: "" }],
          grossesses: parsed.grossesses || [{
            dateDiagnostic: "", rangCpn: "", dateProbableAcc: "", issue: "", dateReelle: "",
            modeAcc: "", allaitement: "", prophylaxie: "", protocole: "", dateDebutProtocole: "",
            pcr1: "", datePrelPcr: "", resultatPcr: "", serologie: "", datePrelSero: "", resultatSero: ""
          }],
          bilans: parsed.bilans || [],
          suivis: parsed.suivis || [],
          suiviss: parsed.suiviss || [],
          fiches: parsed.fiches || [],
          tbFiches: parsed.tbFiches || [],
          suiviArvs: parsed.suiviArvs || [{
            dateVisite: "", situationArv: "", changementLignePreciser: "", protocole: "",
            substitutionMotif: "", substitutionPrecision: "", stadeCliniqueOms: "",
            observanceCorrecte: "", evaluationNutritionnelle: "", classification: "",
            modeleSoinsNumero: "", prochainRdv: ""
          }],
          etape: parsed.etape || 0,
          currentView: parsed.currentView || "home",
          biometrieIris: parsed.biometrieIris || {
            irisImageBase64: "", biometricStatus: "PENDING",
            captureMessage: "", isCameraActive: false
          }
        };
      }
    } catch (error) {
      console.error("Erreur lecture localStorage:", error);
    }

    // Retourner l'état initial si pas de sauvegarde
    return {
      donneesFormulaire: {
        profession: "", statutFamilial: "", personneContact: "", telephoneContact: "",
        codificationNationale: "", dateTest: "", dateConfirmation: "", lieuTest: "",
        resultat: "", soutienNom: "", soutienPrenoms: "", soutienLien: "", soutienTelephone: "",
        soutienAdresse: "", portesEntree: [], reference: "Non", dateReference: "",
        siteOrigine: "", arv: "", dateDebutArv: "", protocoleInitialArv: "",
        protocoleActuelArv: "", nbGrossessesPtme: "", contraception: "", prep: "",
        tuberculose: "", maladiesChroniques: [], autresMaladiesChroniques: "",
        stadeOms: "", dateDebutTar: "", protocoleInitialTar: ""
      },
      contacts: [{ nom: "", type: "", age: "", sexe: "", statut: "", resultat: "", soins: "", id: "" }],
      grossesses: [{
        dateDiagnostic: "", rangCpn: "", dateProbableAcc: "", issue: "", dateReelle: "",
        modeAcc: "", allaitement: "", prophylaxie: "", protocole: "", dateDebutProtocole: "",
        pcr1: "", datePrelPcr: "", resultatPcr: "", serologie: "", datePrelSero: "", resultatSero: ""
      }],
      bilans: [],
      suivis: [],
      suiviss: [],
      fiches: [],
      tbFiches: [],
      suiviArvs: [{
        dateVisite: "", situationArv: "", changementLignePreciser: "", protocole: "",
        substitutionMotif: "", substitutionPrecision: "", stadeCliniqueOms: "",
        observanceCorrecte: "", evaluationNutritionnelle: "", classification: "",
        modeleSoinsNumero: "", prochainRdv: ""
      }],
      etape: 0,
      currentView: "home",
      biometrieIris: {
        irisImageBase64: "", biometricStatus: "PENDING",
        captureMessage: "", isCameraActive: false
      }
    };
  };


    // États avec restauration automatique
    const [donneesFormulaire, setDonneesFormulaire] = useState(getInitialState().donneesFormulaire);
    const [contacts, setContacts] = useState(getInitialState().contacts);
    const [grossesses, setGrossesses] = useState(getInitialState().grossesses);
    const [bilans, setBilans] = useState(getInitialState().bilans);
    const [suivis, setSuivis] = useState(getInitialState().suivis);
    const [suiviss, setSuiviss] = useState(getInitialState().suiviss);
    const [fiches, setFiches] = useState(getInitialState().fiches);
    const [tbFiches, setTbFiches] = useState(getInitialState().tbFiches);
    const [suiviArvs, setSuiviArvs] = useState(getInitialState().suiviArvs);
    const [etape, setEtape] = useState(getInitialState().etape);
    const [currentView, setCurrentView] = useState(getInitialState().currentView);
    const [biometrieIris, setBiometrieIris] = useState(getInitialState().biometrieIris);





 const videoRef = useRef(null);
 const canvasRef = useRef(null);
 const [eyeDetected, setEyeDetected] = useState(false);
  const [detectionLog, setDetectionLog] = useState("");
 // 👇 Pour ESLint et React
 /* global cv */

 const [eyeClassifier, setEyeClassifier] = useState(null);

const [cvReady, setCvReady] = useState(false);

// 🆕 États pour la détection de clignement et scan avancé
const [blinkCount, setBlinkCount] = useState(0);
const [eyeClosed, setEyeClosed] = useState(false);
const prevEyeClosedRef = useRef(false);
const [scanQuality, setScanQuality] = useState(0);
const [distanceFromCamera, setDistanceFromCamera] = useState(0);
const [irisDetected, setIrisDetected] = useState(false);
const [scanProgress, setScanProgress] = useState(0);

// 🆕 États pour la détection multi-algorithmes avancée
const [detectionMethod, setDetectionMethod] = useState('haar'); // 'haar', 'hough', 'template', 'ml'
const [faceDetected, setFaceDetected] = useState(false);
const [eyePosition, setEyePosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
const [irisCenter, setIrisCenter] = useState({ x: 0, y: 0 });
const [pupilSize, setPupilSize] = useState(0);
const [eyeOpenness, setEyeOpenness] = useState(0);
const [lightingCondition, setLightingCondition] = useState('unknown');
const [focusQuality, setFocusQuality] = useState(0);
const [stabilityScore, setStabilityScore] = useState(0);
const [lastStableFrame, setLastStableFrame] = useState(null);
const [detectionConfidence, setDetectionConfidence] = useState(0);
const [adaptiveThreshold, setAdaptiveThreshold] = useState(0.5);
const [scanAttempts, setScanAttempts] = useState(0);
const [maxScanAttempts] = useState(10);


 useEffect(() => {
    // Fonction pour charger un script et retourner une promesse
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
          // Le script est chargé, maintenant on attend que le runtime soit prêt
          const interval = setInterval(() => {
            if (typeof cv !== 'undefined' && cv.getBuildInformation) {
              clearInterval(interval);
              console.log("✅ OpenCV est initialisé et prêt.");
              resolve();
            } else {
              console.log("⏳ Script chargé, attente de l'initialisation du runtime OpenCV...");
            }
          }, 100);
        };
        script.onerror = (err) => {
          console.error("❌ Erreur de chargement du script OpenCV depuis le CDN.", err);
          reject(err);
        };
        document.body.appendChild(script);
      });
    };

    const initializeOpenCv = async () => {
      try {
        console.log("⏳ Chargement d'OpenCV depuis le CDN jsDelivr...");
        await loadScript('https://cdn.jsdelivr.net/npm/opencv.js@4.0.0-v1/opencv.js');
        setCvReady(true);
        loadClassifier();
      } catch (error) {
        setDetectionLog("ERREUR CRITIQUE: Impossible de charger OpenCV.");
      }
    };

    initializeOpenCv();

  }, []);



const loadClassifier = () => {
    console.log("🔍 loadClassifier appelé, cvReady:", cvReady);
    
    if (!cvReady) {
      console.log("❌ OpenCV pas encore prêt");
      return;
    }

    try {
      console.log("🔍 Création du classificateur...");
      const classifier = new cv.CascadeClassifier();
      const utils = new Utils('errorMessage');
      
      // Essayer différents classificateurs dans l'ordre de préférence
      const classifiers = [
        './haarcascade_eye.xml',                    // Classificateur d'yeux simple
        './haarcascade_eye_tree_eyeglasses.xml',   // Classificateur d'yeux avec lunettes
        './haarcascade_frontalface_default.xml',    // Classificateur de visage par défaut
        './haarcascade_frontalface_alt.xml'         // Classificateur de visage alternatif
      ];

      let currentIndex = 0;
      
      const tryNextClassifier = () => {
        if (currentIndex >= classifiers.length) {
          console.error("❌ Tous les classificateurs ont échoué");
          setDetectionLog("Erreur: Impossible de charger les classificateurs");
          return;
        }

        const xmlFile = classifiers[currentIndex];
        console.log(`🔍 Tentative ${currentIndex + 1}/${classifiers.length}: ${xmlFile}`);

        utils.createFileFromUrl(xmlFile, xmlFile, () => {
          console.log(`🔍 Fichier XML téléchargé: ${xmlFile}`);
          if (classifier.load(xmlFile)) {
            console.log(`✅ Classificateur chargé avec succès: ${xmlFile}`);
            setEyeClassifier(classifier);
            const classifierName = xmlFile.includes('eye') ? 'yeux' : 'visage';
            setDetectionLog(`Classificateur ${classifierName} prêt - Attente de détection...`);
          } else {
            console.log(`⚠️ Échec du chargement: ${xmlFile}`);
            currentIndex++;
            tryNextClassifier();
          }
        });
      };

      tryNextClassifier();
    } catch (error) {
      console.error("❌ Erreur lors du chargement du classificateur:", error);
      setDetectionLog("Erreur technique lors du chargement");
    }
  };



// 🆕 Fonction de détection de clignement avancée
const detectBlinkAndIris = () => {
  if (!cvReady || !eyeClassifier || !videoRef.current || !canvasRef.current) {
    return;
  }

  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');

  if (video.videoWidth === 0 || video.videoHeight === 0) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  try {
    // Créer une matrice OpenCV
    const src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    src.data.set(imageData.data);

    // Convertir en niveaux de gris
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Améliorer le contraste
    const equalized = new cv.Mat();
    cv.equalizeHist(gray, equalized);

    // Détecter les yeux avec paramètres optimisés
    const eyes = new cv.RectVector();
    const scaleFactor = 1.05;  // Plus petit = plus précis mais plus lent
    const minNeighbors = 3;     // Plus élevé = moins de faux positifs
    const flags = 0;
    const minSize = new cv.Size(30, 30);   // Taille minimale augmentée
    const maxSize = new cv.Size(200, 200); // Taille maximale augmentée

    eyeClassifier.detectMultiScale(equalized, eyes, scaleFactor, minNeighbors, flags, minSize, maxSize);
    
    console.log(`🔍 Yeux détectés: ${eyes.size()}`);

    // Analyser la qualité et la distance
    const detected = eyes.size() > 0;
    setEyeDetected(detected);

    if (detected) {
      // Calculer la distance estimée basée sur la taille des yeux détectés
      const eye = eyes.get(0);
      const eyeArea = eye.width * eye.height;
      const estimatedDistance = Math.max(0, 100 - (eyeArea / 100));
      setDistanceFromCamera(estimatedDistance);

      // Calculer la qualité du scan basée sur la netteté
      const quality = calculateScanQuality(equalized, eye);
      setScanQuality(quality);

      // Détecter si l'œil est fermé (pour le clignement)
      const currentEyeClosed = detectEyeClosed(equalized, eye);
      
      // Gérer le comptage des clignements (détection du passage fermé -> ouvert)
      if (prevEyeClosedRef.current && !currentEyeClosed) {
        setBlinkCount(prev => prev + 1);
        setScanProgress(prev => Math.min(100, prev + 20));
      }
      
      prevEyeClosedRef.current = currentEyeClosed;
      setEyeClosed(currentEyeClosed);

      // Détecter l'iris
      const irisDetected = detectIrisPattern(equalized, eye);
      setIrisDetected(irisDetected);

      // Dessiner l'interface améliorée
      drawAdvancedInterface(ctx, eye, quality, estimatedDistance, irisDetected);

      setDetectionLog(`✅ Yeux détectés - Distance: ${Math.round(estimatedDistance)}cm - Qualité: ${quality}% - Clignements: ${blinkCount}`);
    } else {
      setDetectionLog("❌ Aucun œil détecté - Approchez-vous de la caméra");
      drawGuidanceInterface(ctx);
    }

    // Nettoyer la mémoire
    src.delete();
    gray.delete();
    equalized.delete();
    eyes.delete();

  } catch (error) {
    console.error("Erreur lors de la détection avancée:", error);
    setDetectionLog("Erreur lors du traitement de l'image");
  }
};

// 🆕 Fonction pour calculer la qualité du scan
const calculateScanQuality = (image, eyeRect) => {
  try {
    // Extraire la région de l'œil
    const eyeRegion = image.roi(eyeRect);
    
    // Calculer la variance de Laplacien pour mesurer la netteté
    const laplacian = new cv.Mat();
    cv.Laplacian(eyeRegion, laplacian, cv.CV_64F);
    
    const mean = new cv.Mat();
    const stddev = new cv.Mat();
    cv.meanStdDev(laplacian, mean, stddev);
    
    const sharpness = stddev.data64F[0];
    const quality = Math.min(100, Math.max(0, (sharpness / 10) * 100));
    
    eyeRegion.delete();
    laplacian.delete();
    mean.delete();
    stddev.delete();
    
    return Math.round(quality);
  } catch (error) {
    return 0;
  }
};

// 🆕 Fonction pour détecter si l'œil est fermé
const detectEyeClosed = (image, eyeRect) => {
  try {
    const eyeRegion = image.roi(eyeRect);
    
    // Calculer l'intensité moyenne
    const mean = new cv.Mat();
    const stddev = new cv.Mat();
    cv.meanStdDev(eyeRegion, mean, stddev);
    
    const avgIntensity = mean.data64F[0];
    
    eyeRegion.delete();
    mean.delete();
    stddev.delete();
    
    // Si l'intensité est très faible, l'œil est probablement fermé
    return avgIntensity < 50;
  } catch (error) {
    return false;
  }
};

// 🆕 Fonctions de détection multi-algorithmes avancées
const detectFace = (image) => {
  try {
    const gray = new cv.Mat();
    cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);
    
    // Charger le classificateur de visage
    const faceCascade = new cv.CascadeClassifier();
    faceCascade.load('./haarcascade_frontalface_default.xml');
    
    const faces = new cv.RectVector();
    faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, new cv.Size(50, 50), new cv.Size(500, 500));
    
    const faceDetected = faces.size() > 0;
    let faceRect = null;
    
    if (faceDetected) {
      faceRect = faces.get(0);
      setFaceDetected(true);
    } else {
      setFaceDetected(false);
    }
    
    // Nettoyer
    gray.delete();
    faceCascade.delete();
    faces.delete();
    
    return { detected: faceDetected, rect: faceRect };
  } catch (error) {
    console.error("Erreur dans detectFace:", error);
    return { detected: false, rect: null };
  }
};

const detectEyeWithHoughCircles = (image, eyeRect) => {
  try {
    const eyeRegion = image.roi(eyeRect);
    const gray = new cv.Mat();
    cv.cvtColor(eyeRegion, gray, cv.COLOR_RGBA2GRAY);
    
    // Appliquer un flou gaussien pour réduire le bruit
    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    
    // Détecter les cercles (iris/pupille)
    const circles = new cv.Mat();
    cv.HoughCircles(blurred, circles, cv.HOUGH_GRADIENT, 1, 20, 50, 30, 5, 50);
    
    let irisDetected = false;
    let irisCenter = { x: 0, y: 0 };
    let pupilSize = 0;
    
    if (circles.rows > 0) {
      const circle = circles.data32F;
      irisCenter.x = circle[0] + eyeRect.x;
      irisCenter.y = circle[1] + eyeRect.y;
      pupilSize = circle[2];
      irisDetected = true;
      
      setIrisCenter(irisCenter);
      setPupilSize(pupilSize);
      setIrisDetected(true);
    } else {
      setIrisDetected(false);
    }
    
    // Nettoyer
    eyeRegion.delete();
    gray.delete();
    blurred.delete();
    circles.delete();
    
    return { detected: irisDetected, center: irisCenter, size: pupilSize };
  } catch (error) {
    console.error("Erreur dans detectEyeWithHoughCircles:", error);
    return { detected: false, center: { x: 0, y: 0 }, size: 0 };
  }
};

const analyzeLightingCondition = (image) => {
  try {
    const gray = new cv.Mat();
    cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);
    
    // Calculer l'histogramme
    const hist = new cv.Mat();
    const mask = new cv.Mat();
    const histSize = [256];
    const ranges = [0, 256];
    cv.calcHist([gray], [0], mask, hist, 1, histSize, ranges);
    
    // Analyser la distribution de luminosité
    const mean = cv.mean(gray)[0];
    const stddev = cv.meanStdDev(gray).stddev[0];
    
    let condition = 'unknown';
    if (mean < 80) condition = 'dark';
    else if (mean > 180) condition = 'bright';
    else if (stddev < 30) condition = 'low_contrast';
    else condition = 'good';
    
    setLightingCondition(condition);
    
    // Nettoyer
    gray.delete();
    hist.delete();
    mask.delete();
    
    return condition;
  } catch (error) {
    console.error("Erreur dans analyzeLightingCondition:", error);
    return 'unknown';
  }
};

const calculateFocusQuality = (image, eyeRect) => {
  try {
    const eyeRegion = image.roi(eyeRect);
    const gray = new cv.Mat();
    cv.cvtColor(eyeRegion, gray, cv.COLOR_RGBA2GRAY);
    
    // Calculer la variance du Laplacien (mesure de netteté)
    const laplacian = new cv.Mat();
    cv.Laplacian(gray, laplacian, cv.CV_64F);
    
    const mean = cv.mean(laplacian);
    const variance = cv.meanStdDev(laplacian).stddev[0];
    
    const focusScore = Math.min(100, Math.max(0, variance * 10));
    setFocusQuality(focusScore);
    
    // Nettoyer
    eyeRegion.delete();
    gray.delete();
    laplacian.delete();
    
    return focusScore;
  } catch (error) {
    console.error("Erreur dans calculateFocusQuality:", error);
    return 0;
  }
};

const calculateStabilityScore = (currentEyeRect) => {
  try {
    if (!lastStableFrame) {
      setLastStableFrame(currentEyeRect);
      return 100;
    }
    
    const prevRect = lastStableFrame;
    const dx = Math.abs(currentEyeRect.x - prevRect.x);
    const dy = Math.abs(currentEyeRect.y - prevRect.y);
    const dw = Math.abs(currentEyeRect.width - prevRect.width);
    const dh = Math.abs(currentEyeRect.height - prevRect.height);
    
    // Calculer un score de stabilité basé sur les changements
    const positionChange = Math.sqrt(dx * dx + dy * dy);
    const sizeChange = Math.sqrt(dw * dw + dh * dh);
    
    const stabilityScore = Math.max(0, 100 - (positionChange + sizeChange) * 2);
    setStabilityScore(stabilityScore);
    
    // Mettre à jour la frame stable si le score est bon
    if (stabilityScore > 70) {
      setLastStableFrame(currentEyeRect);
    }
    
    return stabilityScore;
  } catch (error) {
    console.error("Erreur dans calculateStabilityScore:", error);
    return 0;
  }
};

// 🆕 Fonction pour détecter les patterns d'iris
const detectIrisPattern = (image, eyeRect) => {
  try {
    const eyeRegion = image.roi(eyeRect);
    
    // Améliorer le contraste de la région de l'œil
    const enhanced = new cv.Mat();
    cv.equalizeHist(eyeRegion, enhanced);
    
    // Appliquer un flou gaussien pour réduire le bruit
    const blurred = new cv.Mat();
    cv.GaussianBlur(enhanced, blurred, new cv.Size(5, 5), 0);
    
    // Chercher des cercles (iris) avec paramètres optimisés
    const circles = new cv.Mat();
    const minRadius = Math.max(5, Math.floor(eyeRect.width / 6));
    const maxRadius = Math.floor(eyeRect.width / 2);
    
    cv.HoughCircles(
      blurred, 
      circles, 
      cv.HOUGH_GRADIENT, 
      1,                    // dp: résolution inverse
      blurred.rows / 4,     // minDist: distance minimale entre centres
      50,                   // param1: seuil Canny élevé
      20,                   // param2: seuil d'accumulation (plus bas = plus sensible)
      minRadius,            // rayon minimum
      maxRadius             // rayon maximum
    );
    
    const irisFound = circles.cols > 0;
    
    console.log(`🔍 Détection iris: ${irisFound ? 'OUI' : 'NON'} - Cercles trouvés: ${circles.cols}`);
    
    eyeRegion.delete();
    enhanced.delete();
    blurred.delete();
    circles.delete();
    
    return irisFound;
  } catch (error) {
    console.error('❌ Erreur détection iris:', error);
    return false;
  }
};

// 🆕 Fonction pour dessiner l'interface avancée
const drawAdvancedInterface = (ctx, eye, quality, distance, irisDetected) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(videoRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Dessiner le cadre de l'œil
  ctx.strokeStyle = irisDetected ? '#00ff00' : '#ffff00';
  ctx.lineWidth = 3;
  ctx.strokeRect(eye.x, eye.y, eye.width, eye.height);
  
  // Dessiner le cercle de guidage pour l'iris
  const centerX = eye.x + eye.width / 2;
  const centerY = eye.y + eye.height / 2;
  const radius = Math.min(eye.width, eye.height) / 3;
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = irisDetected ? '#00ff00' : '#ff6600';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Afficher les informations
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial';
  ctx.fillText(`Distance: ${Math.round(distance)}cm`, 10, 30);
  ctx.fillText(`Qualité: ${quality}%`, 10, 60);
  ctx.fillText(`Clignements: ${blinkCount}`, 10, 90);
  ctx.fillText(`Iris: ${irisDetected ? '✅ Détecté' : '❌ Non détecté'}`, 10, 120);
  
  // Barre de progression du scan
  const progressWidth = 200;
  const progressHeight = 20;
  const progressX = (ctx.canvas.width - progressWidth) / 2;
  const progressY = ctx.canvas.height - 50;
  
  ctx.fillStyle = '#333333';
  ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
  
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(progressX, progressY, (scanProgress / 100) * progressWidth, progressHeight);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Arial';
  ctx.fillText(`Scan: ${scanProgress}%`, progressX, progressY - 5);
};

// 🆕 Fonction pour dessiner l'interface de guidage
const drawGuidanceInterface = (ctx) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(videoRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Dessiner un cercle de guidage au centre
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;
  const radius = 100;
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Instructions
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Positionnez votre œil dans le cercle', centerX, centerY - 150);
  ctx.fillText('Clignez des yeux pour valider', centerX, centerY + 150);
};

 const detectEye = () => {
    console.log("🔍 detectEye appelé - cvReady:", cvReady, "eyeClassifier:", !!eyeClassifier, "video:", !!videoRef.current, "canvas:", !!canvasRef.current);
    
    if (!cvReady || !eyeClassifier || !videoRef.current || !canvasRef.current) {
      console.log("❌ Conditions non remplies pour la détection");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    // Définir les dimensions du canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      // Créer une matrice OpenCV à partir de la vidéo
      const src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      src.data.set(imageData.data);

      // Convertir en niveaux de gris
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // Égaliser l'histogramme pour améliorer le contraste
      const equalized = new cv.Mat();
      cv.equalizeHist(gray, equalized);

      // Détecter avec des paramètres adaptatifs selon le type de classificateur
      const eyes = new cv.RectVector();
      
      // Paramètres optimisés pour différents types de détection
      let scaleFactor, minNeighbors, minSize, maxSize;
      
      if (detectionLog.includes('yeux')) {
        // Paramètres pour la détection d'yeux
        scaleFactor = 1.1;
        minNeighbors = 2;
        minSize = new cv.Size(15, 15);
        maxSize = new cv.Size(80, 80);
      } else {
        // Paramètres pour la détection de visage
        scaleFactor = 1.05;
        minNeighbors = 3;
        minSize = new cv.Size(30, 30);
        maxSize = new cv.Size(300, 300);
      }
      
      const flags = 0;

      eyeClassifier.detectMultiScale(equalized, eyes, scaleFactor, minNeighbors, flags, minSize, maxSize);

      // Debug: afficher le nombre de détections
      console.log(`🔍 Détections trouvées: ${eyes.size()}`);

      // Mettre à jour l'état de détection
      const detected = eyes.size() > 0;
      setEyeDetected(detected);

      if (detected) {
        setDetectionLog(`✅ Yeux détectés: ${eyes.size()}`);

        // Dessiner les cercles autour des yeux détectés
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        for (let i = 0; i < eyes.size(); i++) {
          const eye = eyes.get(i);
          ctx.strokeStyle = 'lime';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(
            eye.x + eye.width / 2,
            eye.y + eye.height / 2,
            Math.max(eye.width, eye.height) / 2,
            0,
            2 * Math.PI
          );
          ctx.stroke();

          // Ajouter un texte indiquant "œil détecté"
          ctx.fillStyle = 'lime';
          ctx.font = '14px Arial';
          ctx.fillText('Œil détecté', eye.x, eye.y - 5);
        }
      } else {
        setDetectionLog("❌ Aucun œil détecté - Ajustez la position");

        // Afficher un message d'aide sur le canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Approchez et centrez votre œil', canvas.width / 2, 30);
      }

      // Libérer la mémoire
      src.delete();
      gray.delete();
      equalized.delete();
      eyes.delete();

    } catch (error) {
      console.error("Erreur lors de la détection:", error);
      setDetectionLog("Erreur lors du traitement de l'image");
    }
  };


useEffect(() => {
    let interval;
    if (biometrieIris.isCameraActive && cvReady && eyeClassifier) {
      console.log("✅ Démarrage de la détection avancée d'iris");
      interval = setInterval(detectBlinkAndIris, 150); // Détection avancée toutes les 150ms (optimisé)
    } else if (biometrieIris.isCameraActive && !cvReady) {
      // Détection simplifiée si OpenCV n'est pas disponible
      console.log("⚠️ OpenCV non disponible - Mode simplifié");
      interval = setInterval(() => {
        setDetectionLog("Mode simplifié - Capture directe disponible (OpenCV non chargé)");
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [biometrieIris.isCameraActive, cvReady, eyeClassifier]);

  const capturePhoto = () => {
    // Validation avancée pour la capture
    if (!cvReady) {
      alert("Erreur : OpenCV n'est pas initialisé. Impossible de procéder à la capture.");
      setDetectionLog("❌ Erreur critique: OpenCV non chargé.");
      return; // Bloquer la capture
    } 
    
    if (cvReady) {
      // Vérifications de qualité pour la capture
      if (!eyeDetected) {
        alert("⚠️ Aucun œil détecté ! Positionnez-vous devant la caméra.");
        return;
      }
      
      if (scanQuality < 30) {
        alert("⚠️ Qualité d'image insuffisante ! Améliorez l'éclairage et la netteté.");
        return;
      }
      
      if (distanceFromCamera > 80) {
        alert("⚠️ Trop loin de la caméra ! Approchez-vous à moins de 80cm.");
        return;
      }
      
      if (blinkCount < 1) {
        alert("⚠️ Clignez des yeux pour valider que vous êtes vivant !");
        return;
      }
      
      if (!irisDetected) {
        alert("⚠️ Iris non détecté ! Positionnez votre œil dans le cercle de guidage.");
        return;
      }
      
      if (scanProgress < 80) {
        alert("⚠️ Scan incomplet ! Continuez à cligner des yeux pour compléter le scan.");
        return;
      }
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];

    setBiometrieIris(prev => ({
      ...prev,
      irisImageBase64: base64Data,
      biometricStatus: "CAPTURED",
      captureMessage: "Iris capturé avec succès!",
      isCameraActive: false
    }));

    setDetectionLog("✅ Capture réussie!");
  };

// ✅ State pour la biométrie iris

  // ✅ Simulation capture iris (en attendant un vrai SDK biométrique)
  const simulerCaptureIris = () => {
    setBiometrieIris({
      irisImageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAUA...", // base64 factice
      biometricStatus: "CAPTURED",
      captureMessage: "Simulation réussie ✅",
      isCameraActive: false
    });
  };


  // ... (vos autres states existants)

  // ✅ Effet pour démarrer/arrêter la caméra
  useEffect(() => {
    if (biometrieIris.isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [biometrieIris.isCameraActive]);

  // ✅ Fonction pour démarrer la caméra
 // ✅ Fonction pour démarrer la caméra
 const startCamera = async () => {
   console.log("🔍 startCamera appelé");
   try {
     console.log("🔍 Demande d'accès à la caméra...");
     const stream = await navigator.mediaDevices.getUserMedia({
       video: {
         facingMode: "user", // Caméra frontale pour l'iris
         width: { ideal: 1280 },
         height: { ideal: 720 }
       }
     });

     console.log("✅ Stream caméra obtenu:", stream);
     if (videoRef.current) {
       videoRef.current.srcObject = stream;
     }
   } catch (error) {
     console.error("Erreur d'accès à la caméra:", error);
     setBiometrieIris(prev => ({
       ...prev,
       captureMessage: "Impossible d'accéder à la caméra",
       biometricStatus: "FAILED"
     }));
   }
 };


  // ✅ Fonction pour arrêter la caméra
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };





  // ✅ Fonction pour activer/désactiver la caméra
 const toggleCamera = () => {
   console.log("🔍 toggleCamera appelé");
   setBiometrieIris(prev => ({
     ...prev,
     isCameraActive: !prev.isCameraActive,
     captureMessage: !prev.isCameraActive ? "Préparez-vous à capturer l'iris" : ""
   }));
 };

  // ✅ Fonction pour réinitialiser la capture
  const resetCapture = () => {
    stopCamera();
    setBiometrieIris({
      irisImageBase64: "",
      biometricStatus: "PENDING",
      captureMessage: "",
      isCameraActive: false
    });
    
    // Réinitialiser les états de scan avancé
    setBlinkCount(0);
    setEyeClosed(false);
    setScanQuality(0);
    setDistanceFromCamera(0);
    setIrisDetected(false);
    setScanProgress(0);
    setEyeDetected(false);
    setDetectionLog("");
  };

// ✅ Vérifier si l'iris est capturé avant soumission
const validerEtSoumettre = () => {
  if (biometrieIris.biometricStatus !== "CAPTURED" || !biometrieIris.irisImageBase64) {
    alert("Veuillez d'abord capturer l'iris du patient avant de soumettre le dossier.");
    return;
  }

  handleSubmit();
};

// Dans ton bouton de soumission, utiliser validerEtSoumettre() au lieu de handleSubmit()


 // Sauvegarde automatique dans localStorage
  useEffect(() => {
    const saveData = () => {
      try {
        const dataToSave = {
          donneesFormulaire,
          contacts,
          grossesses,
          bilans,
          suivis,
          suiviss,
          fiches,
          tbFiches,
          suiviArvs,
          etape,
          currentView,
          biometrieIris
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Erreur sauvegarde localStorage:", error);
      }
    };

    // Délai pour éviter de sauvegarder à chaque frappe
    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [
    donneesFormulaire, contacts, grossesses, bilans, suivis,
    suiviss, fiches, tbFiches, suiviArvs, etape, currentView, biometrieIris
  ]);

  // Nettoyage après soumission réussie
  const cleanupStorage = () => {
    localStorage.removeItem(storageKey);
  };

  // Fonctions de gestion des données (elles déclencheront la sauvegarde automatique)

  const gererCheckbox = (champ, valeur) => {
    setDonneesFormulaire((prev) => {
      if (prev[champ].includes(valeur)) {
        return { ...prev, [champ]: prev[champ].filter((v) => v !== valeur) };
      } else {
        return { ...prev, [champ]: [...prev[champ], valeur] };
      }
    });
  };
// garde seulement language









   const ajouterContact = () => {
      setContacts([
        ...contacts,
        { nom: "", type: "", age: "", sexe: "", statut: "", resultat: "", soins: "", id: "" }
      ]);
    };

    const supprimerContact = (index) => {
      const newContacts = contacts.filter((_, i) => i !== index);
      setContacts(newContacts);
    };

    const mettreAJourContact = (index, champ, valeur) => {
      const newContacts = [...contacts];
      newContacts[index][champ] = valeur;
      setContacts(newContacts);
    };



    const ajouterGrossesse = () => {
      setGrossesses([
        ...grossesses,
        {
          dateDiagnostic: "",
          rangCpn: "",
          dateProbableAcc: "",
          issue: "",
          dateReelle: "",
          modeAcc: "",
          allaitement: "",
          prophylaxie: "",
          protocole: "",
          dateDebutProtocole: "",
          pcr1: "",
          datePrelPcr: "",
          resultatPcr: "",
          serologie: "",
          datePrelSero: "",
          resultatSero: "",
        },
      ]);
    };

    const supprimerGrossesse = (index) => {
      setGrossesses(grossesses.filter((_, i) => i !== index));
    };

    const majGrossesse = (index, champ, valeur) => {
      const newGrossesses = [...grossesses];
      newGrossesses[index][champ] = valeur;
      setGrossesses(newGrossesses);
    };



      // ➕ Ajouter un nouveau bilan
      const ajouterBilan = () => {
        setBilans([
          ...bilans,
          {
            date: "",
            hb: "",
            vgm: "",
            ccmh: "",
            gb: "",
            neutrophiles: "",
            lymphocytes: "",
            plaquettes: "",
            alat: "",
            asat: "",
            glycemie: "",
            creat: "",
            aghbs: "",
            tb_lam: "",
            ag_crypto: "",
            genexpert: "",
            proteinurie: "",
            chol_total: "",
            hdl: "",
            ldl: "",
            triglycerides: "",
            depistage_col: "",
            syphilis: "",
          },
        ]);
      };

      // ✏️ Modifier un champ dans un bilan existant
      const modifierBilan = (index, champ, valeur) => {
        const newBilans = [...bilans];
        newBilans[index][champ] = valeur;
        setBilans(newBilans);
      };

      // ❌ Supprimer un bilan
      const supprimerBilan = (index) => {
        setBilans(bilans.filter((_, i) => i !== index));
      };



  // ➕ Ajouter un suivi
  const ajouterSuivi = () => {
    setSuivis([
      ...suivis,
      {
        datePrelevement: "",
        dateResultat: "",
        resultatCV: "",
        dateCD4: "",
        resultatCD4: "",
        cd4Categorie: "", // >=200 ou <200
      },
    ]);
  };

  // ✏️ Modifier un champ
  const modifierSuivi = (index, champ, valeur) => {
    const newSuivis = [...suivis];
    newSuivis[index][champ] = valeur;
    setSuivis(newSuivis);
  };

  // ❌ Supprimer un suivi
  const supprimerSuivi = (index) => {
    setSuivis(suivis.filter((_, i) => i !== index));
  };



// ➕ Ajouter un suivi
const ajouterSuiviImmino = () => {
  setSuiviss([
    ...suiviss,
    {
      datePrelevement: "",
      dateResultat: "",
      resultatCV: "",
      dateCD4: "",
      resultatCD4: "",
      cd4Categorie: "", // >=200 ou <200
    },
  ]);
};

// ✏️ Modifier un champ
const modifierSuiviImmino = (index, champ, valeur) => {
  const newSuiviss = [...suiviss];
  newSuiviss[index][champ] = valeur;
  setSuiviss(newSuiviss);
};

// ❌ Supprimer un suivi
const supprimerSuiviImmino = (index) => {
  setSuiviss(suiviss.filter((_, i) => i !== index));
};



const ajouterFiche = () => {
  setFiches([
    ...fiches,
    {
      date: "",
      taille: "",
      poids: "",
      imc: "",
      ta: "",
      temperature: "",
      pouls: "",
      rechercheTB: "",
      resultatTB: "",
      tpt: "",
      autresPathologies: "",
      cotrimoxazole: "",
    },
  ]);
};

const modifierFiche = (index, champ, valeur) => {
  const newFiches = [...fiches];
  newFiches[index][champ] = valeur;
  setFiches(newFiches);
};

const supprimerFiche = (index) => {
  setFiches(fiches.filter((_, i) => i !== index));
};



// Ajouter une ligne
const ajouterTbFiche = () => {
  setTbFiches([
    ...tbFiches,
    { date: "", debut: "", fin: "", issu: "" },
  ]);
};

// Modifier une cellule
const modifierTbFiche = (index, champ, valeur) => {
  const newFiches = [...tbFiches];
  newFiches[index][champ] = valeur;
  setTbFiches(newFiches);
};

// Supprimer une ligne
const supprimerTbFiche = (index) => {
  setTbFiches(tbFiches.filter((_, i) => i !== index));
};



const ajouterSuiviArv = () => {
  setSuiviArvs([
    ...suiviArvs,
    {
      dateVisite: "",
      situationArv: "",
      changementLignePreciser: "",
      protocole: "",
      substitutionMotif: "",
      substitutionPrecision: "",
      stadeCliniqueOms: "",
      observanceCorrecte: "",
      evaluationNutritionnelle: "",
      classification: "",
      modeleSoinsNumero: "",
      prochainRdv: "",
    },
  ]);
};

const modifierSuiviArv = (index, champ, valeur) => {
  const copie = [...suiviArvs];
  copie[index][champ] = valeur;
  setSuiviArvs(copie);
};

const supprimerSuiviArv = (index) => {
  setSuiviArvs(suiviArvs.filter((_, i) => i !== index));
};

const [dossierCree, setDossierCree] = useState(null);

const resetForm = () => {
  try {
    const init = getInitialState();
    setDonneesFormulaire({ ...init.donneesFormulaire });
    setContacts([]);
    setGrossesses([]);
    setBilans([]);
    setSuivis([]);
    setSuiviss([]);
    setFiches([]);
    setTbFiches([]);
    setSuiviArvs([]);
    setBiometrieIris({ ...init.biometrieIris });
    setEtape(1);
  } catch (_) {
    // sécurité: si certains setters diffèrent, on n'empêche pas la suite
  }
};

const handleSubmit = async () => {
  const payload = {
    // codeDossier: Généré automatiquement par le backend
    codePatient: codePatient,  // peut venir d’un state
        codificationNationale: "CODIFICATION_DU_PATIENT", // ← AJOUTE CE CHAMP
          numeroNotification: "NOTIF_12345", // ← AJOUTE CE CHAMP AUSSI
       identificationBiom: biometrieIris.irisImageBase64 || "DEFAULT_IRIS_TEMPLATE",
        irisImageBase64: biometrieIris.irisImageBase64,    // Image brute (optionnel)
        biometricStatus: biometrieIris.biometricStatus,
       codePatient: codePatient,
    pages: [
      {
        // Section Parents
        pereNomPrenoms: donneesFormulaire.pereNomPrenoms,
        pereStatut: donneesFormulaire.pereStatut,
        pereProfession: donneesFormulaire.pereProfession,
        mereNomPrenoms: donneesFormulaire.mereNomPrenoms,
        mereStatut: donneesFormulaire.mereStatut,

        // Section Test
        dateTest: donneesFormulaire.dateTest,
        dateConfirmation: donneesFormulaire.dateConfirmation,
        lieuTest: donneesFormulaire.lieuTest,
        resultat: donneesFormulaire.resultat,

        // Bilans
        bilans: bilans.map((b) => ({
          hb: b.hb,
          vgm: b.vgm,
          ccmh: b.ccmh,
          gb: b.gb,
          neutrophiles: b.neutrophiles,
          lymphocytes: b.lymphocytes,
          plaquettes: b.plaquettes,
          alat: b.alat,
          asat: b.asat,
          glycemie: b.glycemie,
          creat: b.creat,
          aghbs: b.aghbs,
          tb_lam: b.tb_lam,
          ag_crypto: b.ag_crypto,
          genexpert: b.genexpert,
          proteinurie: b.proteinurie,
          chol_total: b.chol_total,
          hdl: b.hdl,
          ldl: b.ldl,
          triglycerides: b.triglycerides,
          depistage_col: b.depistage_col,
          syphilis: b.syphilis,
        })),
        // PTME (grossesses)
        ptmes: grossesses.map((g) => ({
          dateDiagnostic: g.dateDiagnostic,
          rangCpn: g.rangCpn,
          dateProbableAcc: g.dateProbableAcc,
          issue: g.issue,
          dateReelle: g.dateReelle,
          modeAcc: g.modeAcc,
          allaitement: g.allaitement,
          prophylaxie: g.prophylaxie,
          protocole: g.protocole,
          dateDebutProtocole: g.dateDebutProtocole,
          pcr1: g.pcr1,
          datePrelPcr: g.datePrelPcr,
          resultatPcr: g.resultatPcr,
          serologie: g.serologie,
          datePrelSero: g.datePrelSero,
          resultatSero: g.resultatSero,
        })),


        // Dépistage familiaux
        depistageFamiliales: contacts.map((c) => ({
          nom: c.nom,
          type: c.type,
          age: c.age,
          sexe: c.sexe,
          statut: c.statut,
          resultat: c.resultat,
        })),

        // Index tests
        indexTests: contacts.map((c) => ({
          nom: c.nom,
          type: c.type,
          statut: c.statut,
        })),

        // Suivi immuno-virologique
        suiviImmunovirologiques: suivis.map((s) => ({
          datePrelevement: s.datePrelevement,
          dateResultat: s.dateResultat,
          resultatCV: s.resultatCV,
          dateCD4: s.dateCD4,
          resultatCD4: s.resultatCD4,
          cd4Categorie: s.cd4Categorie,
        })),

        // Suivi pathologique
        suiviPathologiques: fiches.map((f) => ({
          date: f.date,
          taille: f.taille,
          poids: f.poids,
          imc: f.imc,
          ta: f.ta,
          temperature: f.temperature,
          pouls: f.pouls,
          rechercheTB: f.rechercheTB,
          resultatTB: f.resultatTB,
          tpt: f.tpt,
          autresPathologies: f.autresPathologies,
          cotrimoxazole: f.cotrimoxazole,
        })),

        // Suivi ARV
        suiviARVs: suiviArvs.map((a) => ({
          dateVisite: a.dateVisite,
          situationArv: a.situationArv,
          changementLignePreciser: a.changementLignePreciser,
          protocole: a.protocole,
          substitutionMotif: a.substitutionMotif,
          substitutionPrecision: a.substitutionPrecision,
          stadeCliniqueOms: a.stadeCliniqueOms,
          observanceCorrecte: a.observanceCorrecte,
          evaluationNutritionnelle: a.evaluationNutritionnelle,
          classification: a.classification,
          modeleSoinsNumero: a.modeleSoinsNumero,
          prochainRdv: a.prochainRdv,
        })),

        // Prise en charge TB
        priseEnChargeTbs: tbFiches.map((tb) => ({
          date: tb.date,
          debut: tb.debut,
          fin: tb.fin,
          issu: tb.issu,
        })),
      },
    ],
  };

  try {
     const token = localStorage.getItem("token"); // là où tu stockes ton JWT après login

     const response = await axios.post(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/dossiers`, payload, {
       headers: {
         Authorization: `Bearer ${token}`,   // ✅ indispensable
         "Content-Type": "application/json", // déjà par défaut mais c'est clair
       },
     });

  console.log("✅ Succès :", response.data);
  if (onSuccess) {
    cleanupStorage();
    onSuccess(response.data);
  } else {
    cleanupStorage();
    resetForm();
    setDossierCree(response.data);
  }

   }catch (error) {
     console.error("❌ Erreur :", error);

     if (error.response?.status === 403) {
       alert("⚠️ Accès refusé : token manquant ou invalide.");
     } else {
       alert("❌ Une erreur est survenue lors de la soumission.");
     }
   }
 };

// Affichage direct de la vue dossier après création
if (dossierCree) {
  return <DossierView dossier={dossierCree} language={language} />;
}




const sections = [
  {
    titre: (
      <h2 className="flex items-center gap-2 text-xl font-bold text-blue-800">
        <Eye className="w-6 h-6" />
        {getTranslation("biometricIdentification", language) || "Identification Biométrique Iris"}
      </h2>
    ),
    contenu: (
      <div className="grid gap-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 mb-6 text-sm">
            {getTranslation("biometricInstructions", language) ||
             "Positionnez l'œil du patient devant la caméra et capturez l'image de l'iris"}
          </p>

          {/* Affichage de la caméra ou de l'image capturée */}
          <div className="relative mb-6">
            {biometrieIris.isCameraActive ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-md mx-auto rounded-lg border-2 border-blue-500"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-4 border-white rounded-full opacity-50"></div>
                </div>
              </div>
            ) : biometrieIris.irisImageBase64 ? ( // 👈 CORRECTION ICI - enlevé le { en trop
              <div className="relative">
                <img
                  src={`data:image/jpeg;base64,${biometrieIris.irisImageBase64}`}
                  alt="Iris capturé"
                  className="w-full max-w-md mx-auto rounded-lg border-2 border-green-500 shadow-md"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                  ✅ Validé
                </div>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            ) :(
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    {getTranslation("noIrisImage", language) || "Aucune image d'iris capturée"}
                  </p>
                </div>
              </div>
            )}

            {/* Canvas caché pour la capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Ajouter cet indicateur de statut */}
          <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-blue-800 font-semibold">
              Statut Biométrique:
              <span className={`ml-2 ${
                biometrieIris.biometricStatus === "CAPTURED" ? "text-green-600" :
                biometrieIris.biometricStatus === "FAILED" ? "text-red-600" :
                "text-orange-600"
              }`}>
                {biometrieIris.biometricStatus}
              </span>
            </p>
            {biometrieIris.biometricStatus === "CAPTURED" && (
              <p className="text-green-600 text-sm mt-1">
                ✅ Iris capturé avec succès - Prêt pour la soumission
              </p>
            )}
          </div>

          {/* Boutons de contrôle */}
          <div className="flex flex-wrap gap-4 justify-center">
            {!biometrieIris.irisImageBase64 && (
              <button
                onClick={toggleCamera}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                  biometrieIris.isCameraActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {biometrieIris.isCameraActive ? (
                  <>
                    <Video className="w-5 h-5" />
                    Arrêter la caméra
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Ouvrir la caméra
                  </>
                )}
              </button>
            )}

            {biometrieIris.isCameraActive && (
              <button
                onClick={capturePhoto}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Circle className="w-5 h-5" />
                Capturer
              </button>
            )}

            {biometrieIris.irisImageBase64 && (
              <button
                onClick={resetCapture}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reprendre la capture
              </button>
            )}

            {/* Bouton de simulation (pour tests) */}
            <button
              onClick={simulerCaptureIris}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Simuler Capture
            </button>
          </div>

          {/* Message d'état */}
          {biometrieIris.captureMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              biometrieIris.biometricStatus === "CAPTURED"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}>
              {biometrieIris.captureMessage}
            </div>
          )}

          {/* Interface de scan avancée */}
          {biometrieIris.isCameraActive && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">🔬 Scan d'Iris Avancé</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-600">Distance de la caméra</p>
                  <p className="text-xl font-bold text-blue-600">{Math.round(distanceFromCamera)}cm</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-600">Qualité du scan</p>
                  <p className="text-xl font-bold text-green-600">{scanQuality}%</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-600">Clignements détectés</p>
                  <p className="text-xl font-bold text-purple-600">{blinkCount}</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-600">Iris détecté</p>
                  <p className="text-xl font-bold text-orange-600">{irisDetected ? '✅' : '❌'}</p>
                </div>
              </div>
              
              {/* Barre de progression du scan */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progression du scan</span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Instructions de guidage */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-800 mb-2">📋 Instructions :</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Positionnez votre œil dans le cercle de guidage</li>
                  <li>• Clignez des yeux pour valider votre présence</li>
                  <li>• Maintenez une distance de 30-80cm de la caméra</li>
                  <li>• Assurez-vous d'un bon éclairage</li>
                  <li>• Restez immobile pendant le scan</li>
                </ul>
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
            <p className="text-gray-800 text-sm font-semibold">🔍 Debug Info:</p>
            <div className="text-gray-700 text-xs mt-2">
              <p>OpenCV Ready: {cvReady ? '✅' : '❌'}</p>
              <p>Eye Classifier: {eyeClassifier ? '✅' : '❌'}</p>
              <p>Camera Active: {biometrieIris.isCameraActive ? '✅' : '❌'}</p>
              <p>Eye Detected: {eyeDetected ? '✅' : '❌'}</p>
              <p>Detection Log: {detectionLog || 'Aucun'}</p>
            </div>
            <div className="mt-3">
              <button
                onClick={() => {
                  console.log("🔍 Test OpenCV - cv object:", typeof cv, cv);
                  console.log("🔍 Test OpenCV - cvReady:", cvReady);
                  console.log("🔍 Test OpenCV - eyeClassifier:", !!eyeClassifier);
                  if (typeof cv !== 'undefined') {
                    console.log("🔍 Test OpenCV - getBuildInformation:", cv.getBuildInformation ? 'Available' : 'Not available');
                  }
                }}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Test OpenCV
              </button>
            </div>
          </div>

          {/* Instructions supplémentaires */}
          {biometrieIris.isCameraActive && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 Instructions:
              </p>
              <ul className="text-blue-700 text-xs mt-2 list-disc list-inside">
                <li>Assurez-vous que l'œil est bien éclairé</li>
                <li>Maintenez la caméra à environ 10-15 cm de l'œil</li>
                <li>Centrez l'iris dans le cercle</li>
                <li>Restez immobile pendant la capture</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  },
   {
     titre: (
       <h2>{getTranslation("sectionI", language) || "Inscription"}</h2>
     ),
     contenu: (
       <div className="grid gap-4">
         <div className="grid grid-cols-2 gap-4">
           <input
             type="text"
             placeholder={getTranslation("profession", language)}
             value={donneesFormulaire.profession}
             onChange={(e) =>
               setDonneesFormulaire({
                 ...donneesFormulaire,
                 profession: e.target.value,
               })
             }
             className="p-2 border rounded"
           />
           <select
             value={donneesFormulaire.statutFamilial}
             onChange={(e) =>
               setDonneesFormulaire({
                 ...donneesFormulaire,
                 statutFamilial: e.target.value,
               })
             }
             className="p-2 border rounded"
           >
             <option value="">{getTranslation("select", language)}</option>
             <option value="celibataire">{getTranslation("celibataire", language)}</option>
             <option value="marie">{getTranslation("marie", language)}</option>
             <option value="divorce">{getTranslation("divorce", language)}</option>
             <option value="veuf">{getTranslation("veuf", language)}</option>
           </select>
         </div>

         <div className="grid grid-cols-2 gap-4">
           <input
             type="text"
             placeholder={getTranslation("personneContact", language)}
             value={donneesFormulaire.personneContact}
             onChange={(e) =>
               setDonneesFormulaire({
                 ...donneesFormulaire,
                 personneContact: e.target.value,
               })
             }
             className="p-2 border rounded"
           />
           <input
             type="text"
             placeholder={getTranslation("telephoneContact", language)}
             value={donneesFormulaire.telephoneContact}
             onChange={(e) =>
               setDonneesFormulaire({
                 ...donneesFormulaire,
                 telephoneContact: e.target.value,
               })
             }
             className="p-2 border rounded"
           />
         </div>
       </div>
     ),
   },

    {
      titre: <h2>{getTranslation("sectionII", language)}</h2>,
      contenu: (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>{getTranslation("dateTest", language)} *</label>
              <input
                type="date"
                value={donneesFormulaire.dateTest}
                onChange={(e) =>
                  setDonneesFormulaire({
                    ...donneesFormulaire,
                    dateTest: e.target.value,
                  })
                }
                className="p-2 border rounded w-full"
              />
            </div>
            <div>
              <label>{getTranslation("dateConfirmation", language)}</label>
              <input
                type="date"
                value={donneesFormulaire.dateConfirmation}
                onChange={(e) =>
                  setDonneesFormulaire({
                    ...donneesFormulaire,
                    dateConfirmation: e.target.value,
                  })
                }
                className="p-2 border rounded w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>{getTranslation("lieuTest", language)}</label>
              <div className="flex flex-col">
                <label>
                  <input
                    type="radio"
                    name="lieuTest"
                    value="structure"
                    checked={donneesFormulaire.lieuTest === "structure"}
                    onChange={(e) =>
                      setDonneesFormulaire({
                        ...donneesFormulaire,
                        lieuTest: e.target.value,
                      })
                    }
                  />{" "}
                  {getTranslation("structureSanitaire", language)}
                </label>
                <label>
                  <input
                    type="radio"
                    name="lieuTest"
                    value="autre"
                    checked={donneesFormulaire.lieuTest === "autre"}
                    onChange={(e) =>
                      setDonneesFormulaire({
                        ...donneesFormulaire,
                        lieuTest: e.target.value,
                      })
                    }
                  />{" "}
                  {getTranslation("autre", language)}
                </label>
              </div>
            </div>

            <div>
              <label>{getTranslation("resultat", language)}</label>
              <div className="flex flex-col">
                {["vih1", "vih2", "vih12"].map((opt) => (
                  <label key={opt}>
                    <input
                      type="radio"
                      name="resultat"
                      value={opt}
                      checked={donneesFormulaire.resultat === opt}
                      onChange={(e) =>
                        setDonneesFormulaire({
                          ...donneesFormulaire,
                          resultat: e.target.value,
                        })
                      }
                    />{" "}
                    {getTranslation(opt, language)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
 //limite translation
   {
     titre: <h2>{getTranslation("sectionIII", language)}</h2>,
     contenu: (
       <div className="grid gap-4">
         <div className="grid grid-cols-2 gap-4">
           <input
             type="text"
             placeholder={getTranslation("nom", language)}
             value={donneesFormulaire.soutienNom}
             onChange={(e) =>
               setDonneesFormulaire({
                 ...donneesFormulaire,
                 soutienNom: e.target.value,
               })
             }
             className="p-2 border rounded"
           />
           <input
             type="text"
             placeholder={getTranslation("prenoms", language)}
             value={donneesFormulaire.soutienPrenoms}
             onChange={(e) =>
               setDonneesFormulaire({
                 ...donneesFormulaire,
                 soutienPrenoms: e.target.value,
               })
             }
             className="p-2 border rounded"
           />
         </div>
         <div className="grid grid-cols-2 gap-4">
           <input
             type="text"
             placeholder={getTranslation("lienParente", language)}
             value={donneesFormulaire.soutienLien}
             onChange={(e) =>
               setDonneesFormulaire({
                 ...donneesFormulaire,
                 soutienLien: e.target.value,
               })
             }
             className="p-2 border rounded"
           />
           <input
             type="text"
             placeholder={getTranslation("telephone", language)}
             value={donneesFormulaire.soutienTelephone}
             onChange={(e) =>
               setDonneesFormulaire({
                 ...donneesFormulaire,
                 soutienTelephone: e.target.value,
               })
             }
             className="p-2 border rounded"
           />
         </div>
         <input
           type="text"
           placeholder={getTranslation("adresse", language)}
           value={donneesFormulaire.soutienAdresse}
           onChange={(e) =>
             setDonneesFormulaire({
               ...donneesFormulaire,
               soutienAdresse: e.target.value,
             })
           }
           className="p-2 border rounded w-full"
         />
       </div>
     ),
   },

   {
     titre: <h2>{getTranslation("sectionIV", language)}</h2>,
     contenu: (
       <div className="grid gap-4">
         <div className="grid grid-cols-3 gap-2">
           {[
             "pec",
             "aesSexe",
             "tb",
             "donSang",
             "ptme",
             "indexFamille",
             "ist",
             "indexPartenaire",
             "cdv",
             "autoOriente",
             "aesSang",
           ].map((opt) => (
             <label key={opt}>
               <input
                 type="checkbox"
                 checked={donneesFormulaire.portesEntree.includes(opt)}
                 onChange={() => gererCheckbox("portesEntree", opt)}
               />{" "}
               {getTranslation(opt, language)}
             </label>
           ))}
         </div>

         <div className="flex gap-4 items-center">
           <label>{getTranslation("reference", language)} :</label>
           {["oui", "non"].map((opt) => (
             <label key={opt}>
               <input
                 type="radio"
                 name="reference"
                 value={opt}
                 checked={donneesFormulaire.reference === opt}
                 onChange={(e) =>
                   setDonneesFormulaire({
                     ...donneesFormulaire,
                     reference: e.target.value,
                   })
                 }
               />{" "}
               {getTranslation(opt, language)}
             </label>
           ))}
         </div>

         <div>
           <label>{getTranslation("dateReference", language)}</label>
           <input
             type="date"
             value={donneesFormulaire.dateReference}
             onChange={(e) =>
               setDonneesFormulaire({
                 ...donneesFormulaire,
                 dateReference: e.target.value,
               })
             }
             className="p-2 border rounded"
           />
         </div>

         <input
           type="text"
           placeholder={getTranslation("siteOrigine", language)}
           value={donneesFormulaire.siteOrigine}
           onChange={(e) =>
             setDonneesFormulaire({
               ...donneesFormulaire,
               siteOrigine: e.target.value,
             })
           }
           className="p-2 border rounded w-full"
         />
       </div>
     ),
   },
{
  titre: <h2>{getTranslation("sectionV", language)}</h2>,
  contenu: (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>{getTranslation("arv", language)}</label>
          <div className="flex flex-col">
            {["oui", "non"].map((opt) => (
              <label key={opt}>
                <input
                  type="radio"
                  name="arv"
                  value={opt}
                  checked={donneesFormulaire.arv === opt}
                  onChange={(e) =>
                    setDonneesFormulaire({
                      ...donneesFormulaire,
                      arv: e.target.value,
                    })
                  }
                />{" "}
                {getTranslation(opt, language)}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label>{getTranslation("dateDebutArv", language)}</label>
          <input
            type="date"
            value={donneesFormulaire.dateDebutArv}
            onChange={(e) =>
              setDonneesFormulaire({
                ...donneesFormulaire,
                dateDebutArv: e.target.value,
              })
            }
            className="p-2 border rounded w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder={getTranslation("protocoleInitialArv", language)}
          value={donneesFormulaire.protocoleInitialArv}
          onChange={(e) =>
            setDonneesFormulaire({
              ...donneesFormulaire,
              protocoleInitialArv: e.target.value,
            })
          }
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder={getTranslation("protocoleActuelArv", language)}
          value={donneesFormulaire.protocoleActuelArv}
          onChange={(e) =>
            setDonneesFormulaire({
              ...donneesFormulaire,
              protocoleActuelArv: e.target.value,
            })
          }
          className="p-2 border rounded"
        />
      </div>
    </div>
  ),
},

   {
     titre: <h2>{getTranslation("sectionVI", language)}</h2>,
     contenu: (
       <div>
         <label>{getTranslation("nbGrossessesPtme", language)}</label>
         <input
           type="number"
           value={donneesFormulaire.nbGrossessesPtme}
           onChange={(e) =>
             setDonneesFormulaire({
               ...donneesFormulaire,
               nbGrossessesPtme: e.target.value,
             })
           }
           className="p-2 border rounded w-full"
         />
       </div>
     ),
   },
{
  titre: <h2>{getTranslation("sectionVII", language)}</h2>,
  contenu: (
    <div className="grid gap-4">
      <div>
        <label>{getTranslation("contraception", language)}</label>
        <div className="flex gap-4">
          {["oui", "non", "na"].map((opt) => (
            <label key={opt}>
              <input
                type="radio"
                name="contraception"
                value={opt}
                checked={donneesFormulaire.contraception === opt}
                onChange={(e) =>
                  setDonneesFormulaire({
                    ...donneesFormulaire,
                    contraception: e.target.value,
                  })
                }
              />{" "}
              {getTranslation(opt, language)}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label>{getTranslation("prep", language)}</label>
        <div className="flex gap-4">
          {["oui", "non"].map((opt) => (
            <label key={opt}>
              <input
                type="radio"
                name="prep"
                value={opt}
                checked={donneesFormulaire.prep === opt}
                onChange={(e) =>
                  setDonneesFormulaire({
                    ...donneesFormulaire,
                    prep: e.target.value,
                  })
                }
              />{" "}
              {getTranslation(opt, language)}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label>{getTranslation("tuberculose", language)}</label>
        <div className="flex gap-4">
          {["oui", "non", "neSaitPas"].map((opt) => (
            <label key={opt}>
              <input
                type="radio"
                name="tuberculose"
                value={opt}
                checked={donneesFormulaire.tuberculose === opt}
                onChange={(e) =>
                  setDonneesFormulaire({
                    ...donneesFormulaire,
                    tuberculose: e.target.value,
                  })
                }
              />{" "}
              {getTranslation(opt, language)}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label>{getTranslation("maladiesChroniques", language)}</label>
        <div className="flex gap-4">
          {["diabete", "hta", "hepatiteB"].map((opt) => (
            <label key={opt}>
              <input
                type="checkbox"
                checked={donneesFormulaire.maladiesChroniques.includes(opt)}
                onChange={() => gererCheckbox("maladiesChroniques", opt)}
              />{" "}
              {getTranslation(opt, language)}
            </label>
          ))}
        </div>
      </div>

      <textarea
        placeholder={getTranslation("autresMaladiesChroniques", language)}
        value={donneesFormulaire.autresMaladiesChroniques}
        onChange={(e) =>
          setDonneesFormulaire({
            ...donneesFormulaire,
            autresMaladiesChroniques: e.target.value,
          })
        }
        className="p-2 border rounded w-full"
        rows="3"
        maxLength="500"
      />
    </div>
  ),
},
{
  titre: <h2>{getTranslation("sectionVIII", language)}</h2>,
  contenu: (
    <div className="grid gap-4">
      <div>
        <label>{getTranslation("stadeOmsInitial", language)}</label>
        <div className="flex gap-4">
          {["1", "2", "3", "4"].map((opt) => (
            <label key={opt}>
              <input
                type="radio"
                name="stadeOms"
                value={opt}
                checked={donneesFormulaire.stadeOms === opt}
                onChange={(e) =>
                  setDonneesFormulaire({
                    ...donneesFormulaire,
                    stadeOms: e.target.value,
                  })
                }
              />{" "}
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label>{getTranslation("dateDebutTar", language)}</label>
        <input
          type="date"
          value={donneesFormulaire.dateDebutTar}
          onChange={(e) =>
            setDonneesFormulaire({
              ...donneesFormulaire,
              dateDebutTar: e.target.value,
            })
          }
          className="p-2 border rounded w-full"
        />
      </div>

      <input
        type="text"
        placeholder={getTranslation("protocoleInitialTar", language)}
        value={donneesFormulaire.protocoleInitialTar}
        onChange={(e) =>
          setDonneesFormulaire({
            ...donneesFormulaire,
            protocoleInitialTar: e.target.value,
          })
        }
        className="p-2 border rounded w-full"
      />
    </div>
  ),
},
{
  titre: <h2>{getTranslation("sectionIX", language)}</h2>,
  contenu: (
    <div className="p-4 border rounded-lg">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">#</th>
            <th className="border p-2">{getTranslation("nom", language)}</th>
            <th className="border p-2">{getTranslation("typeContact", language)}</th>
            <th className="border p-2">{getTranslation("age", language)}</th>
            <th className="border p-2">{getTranslation("sexe", language)}</th>
            <th className="border p-2">{getTranslation("statutVih", language)}</th>
            <th className="border p-2">{getTranslation("resultatTest", language)}</th>
            <th className="border p-2">{getTranslation("enroleSoins", language)}</th>
            <th className="border p-2">{getTranslation("id", language)}</th>
            <th className="border p-2">{getTranslation("actions", language)}</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c, i) => (
            <tr key={i}>
              <td className="border p-2">{i + 1}</td>
              <td className="border p-2">
                <input
                  type="text"
                  value={c.nom}
                  onChange={(e) => mettreAJourContact(i, "nom", e.target.value)}
                  className="border p-1 w-full"
                />
              </td>
              <td className="border p-2">
                <select
                  value={c.type}
                  onChange={(e) => mettreAJourContact(i, "type", e.target.value)}
                  className="border p-1 w-full"
                >
                  <option value="">{getTranslation("vide", language)}</option>
                  <option value="1">{getTranslation("conjointPartenaire", language)}</option>
                  <option value="2">{getTranslation("enfantMoins15", language)}</option>
                  <option value="3">{getTranslation("cdi", language)}</option>
                </select>
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={c.age}
                  onChange={(e) => mettreAJourContact(i, "age", e.target.value)}
                  className="border p-1 w-full"
                />
              </td>
              <td className="border p-2">
                <select
                  value={c.sexe}
                  onChange={(e) => mettreAJourContact(i, "sexe", e.target.value)}
                  className="border p-1 w-full"
                >
                  <option value="">{getTranslation("vide", language)}</option>
                  <option value="M">{getTranslation("masculin", language)}</option>
                  <option value="F">{getTranslation("feminin", language)}</option>
                </select>
              </td>
              <td className="border p-2">
                <select
                  value={c.statut}
                  onChange={(e) => mettreAJourContact(i, "statut", e.target.value)}
                  className="border p-1 w-full"
                >
                  <option value="">{getTranslation("vide", language)}</option>
                  <option value="P">{getTranslation("positif", language)}</option>
                  <option value="N">{getTranslation("negatif", language)}</option>
                  <option value="Inconnu">{getTranslation("inconnu", language)}</option>
                </select>
              </td>
              <td className="border p-2">
                <select
                  value={c.resultat}
                  onChange={(e) => mettreAJourContact(i, "resultat", e.target.value)}
                  className="border p-1 w-full"
                >
                  <option value="">{getTranslation("vide", language)}</option>
                  <option value="P">{getTranslation("positif", language)}</option>
                  <option value="N">{getTranslation("negatif", language)}</option>
                </select>
              </td>
              <td className="border p-2">
                <select
                  value={c.soins}
                  onChange={(e) => mettreAJourContact(i, "soins", e.target.value)}
                  className="border p-1 w-full"
                >
                  <option value="">{getTranslation("vide", language)}</option>
                  <option value="O">{getTranslation("oui", language)}</option>
                  <option value="N">{getTranslation("non", language)}</option>
                  <option value="NA">{getTranslation("na", language)}</option>
                </select>
              </td>
              <td className="border p-2">
                <input
                  type="text"
                  value={c.id}
                  onChange={(e) => mettreAJourContact(i, "id", e.target.value)}
                  className="border p-1 w-full"
                />
              </td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => supprimerContact(i)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  {getTranslation("supprimer", language)}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={ajouterContact}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
      >
        + {getTranslation("ajouterContact", language)}
      </button>
    </div>
  ),
},
{
  titre: <h2>{getTranslation("sectionX", language)}</h2>,
  contenu: (
    <div className="p-4 border rounded-lg">
      {/* Conteneur scrollable */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">#</th>
              <th className="border p-2">{getTranslation("dateDiagGrossesse", language)}</th>
              <th className="border p-2">{getTranslation("rangCpnDateProbAcc", language)}</th>
              <th className="border p-2">{getTranslation("issueDateAccAvort", language)}</th>
              <th className="border p-2">{getTranslation("modeAccouchement", language)}</th>
              <th className="border p-2">{getTranslation("allaitement", language)}</th>
              <th className="border p-2">{getTranslation("prophylaxieNn", language)}</th>
              <th className="border p-2">{getTranslation("pcr1", language)}</th>
              <th className="border p-2">{getTranslation("serologie", language)}</th>
              <th className="border p-2">{getTranslation("actions", language)}</th>
            </tr>
          </thead>
          <tbody>
            {grossesses.map((g, i) => (
              <tr key={i}>
                <td className="border p-2">{i + 1}</td>

                {/* Date diag grossesse */}
                <td className="border p-2">
                  <input
                    type="date"
                    value={g.dateDiagnostic}
                    onChange={(e) => majGrossesse(i, "dateDiagnostic", e.target.value)}
                    className="border p-1 w-full"
                  />
                </td>

                {/* Rang CPN + Date probable acc */}
                <td className="border p-2">
                  <input
                    type="number"
                    value={g.rangCpn}
                    onChange={(e) => majGrossesse(i, "rangCpn", e.target.value)}
                    className="border p-1 w-16"
                  />
                  <input
                    type="date"
                    value={g.dateProbableAcc}
                    onChange={(e) => majGrossesse(i, "dateProbableAcc", e.target.value)}
                    className="border p-1 w-full mt-1"
                  />
                </td>

                {/* Issue + Date réelle */}
                <td className="border p-2">
                  <select
                    value={g.issue}
                    onChange={(e) => majGrossesse(i, "issue", e.target.value)}
                    className="border p-1 w-full"
                  >
                    <option value="">{getTranslation("vide", language)}</option>
                    <option value="1">{getTranslation("avortement", language)}</option>
                    <option value="2">{getTranslation("accouchementVivant", language)}</option>
                    <option value="3">{getTranslation("accouchementMortNe", language)}</option>
                  </select>
                  <input
                    type="date"
                    value={g.dateReelle}
                    onChange={(e) => majGrossesse(i, "dateReelle", e.target.value)}
                    className="border p-1 w-full mt-1"
                  />
                </td>

                {/* Mode d'accouchement */}
                <td className="border p-2">
                  <select
                    value={g.modeAcc}
                    onChange={(e) => majGrossesse(i, "modeAcc", e.target.value)}
                    className="border p-1 w-full"
                  >
                    <option value="">{getTranslation("vide", language)}</option>
                    <option value="1">{getTranslation("voieBasse", language)}</option>
                    <option value="2">{getTranslation("cesarienne", language)}</option>
                  </select>
                </td>

                {/* Allaitement */}
                <td className="border p-2">
                  <select
                    value={g.allaitement}
                    onChange={(e) => majGrossesse(i, "allaitement", e.target.value)}
                    className="border p-1 w-full"
                  >
                    <option value="">{getTranslation("vide", language)}</option>
                    <option value="1">{getTranslation("ameArv", language)}</option>
                    <option value="2">{getTranslation("ameSansArv", language)}</option>
                    <option value="3">{getTranslation("aa", language)}</option>
                    <option value="4">{getTranslation("autre", language)}</option>
                  </select>
                </td>

                {/* Prophylaxie NN */}
                <td className="border p-2">
                  <select
                    value={g.prophylaxie}
                    onChange={(e) => majGrossesse(i, "prophylaxie", e.target.value)}
                    className="border p-1 w-full"
                  >
                    <option value="">{getTranslation("vide", language)}</option>
                    <option value="0">{getTranslation("oui", language)}</option>
                    <option value="1">{getTranslation("non", language)}</option>
                  </select>
                  <input
                    type="text"
                    value={g.protocole}
                    onChange={(e) => majGrossesse(i, "protocole", e.target.value)}
                    className="border p-1 w-full mt-1"
                    placeholder={getTranslation("protocole", language)}
                  />
                  <input
                    type="date"
                    value={g.dateDebutProtocole}
                    onChange={(e) => majGrossesse(i, "dateDebutProtocole", e.target.value)}
                    className="border p-1 w-full mt-1"
                  />
                </td>

                {/* PCR1 */}
                <td className="border p-2">
                  <select
                    value={g.pcr1}
                    onChange={(e) => majGrossesse(i, "pcr1", e.target.value)}
                    className="border p-1 w-full"
                  >
                    <option value="">{getTranslation("vide", language)}</option>
                    <option value="0">{getTranslation("oui", language)}</option>
                    <option value="1">{getTranslation("non", language)}</option>
                  </select>
                  <input
                    type="date"
                    value={g.datePrelPcr}
                    onChange={(e) => majGrossesse(i, "datePrelPcr", e.target.value)}
                    className="border p-1 w-full mt-1"
                  />
                  <input
                    type="text"
                    value={g.resultatPcr}
                    onChange={(e) => majGrossesse(i, "resultatPcr", e.target.value)}
                    className="border p-1 w-full mt-1"
                    placeholder={getTranslation("resultat", language)}
                  />
                </td>

                {/* Sérologie */}
                <td className="border p-2">
                  <select
                    value={g.serologie}
                    onChange={(e) => majGrossesse(i, "serologie", e.target.value)}
                    className="border p-1 w-full"
                  >
                    <option value="">{getTranslation("vide", language)}</option>
                    <option value="0">{getTranslation("oui", language)}</option>
                    <option value="1">{getTranslation("non", language)}</option>
                  </select>
                  <input
                    type="date"
                    value={g.datePrelSero}
                    onChange={(e) => majGrossesse(i, "datePrelSero", e.target.value)}
                    className="border p-1 w-full mt-1"
                  />
                  <input
                    type="text"
                    value={g.resultatSero}
                    onChange={(e) => majGrossesse(i, "resultatSero", e.target.value)}
                    className="border p-1 w-full mt-1"
                    placeholder={getTranslation("resultat", language)}
                  />
                </td>

                {/* Actions */}
                <td className="border p-2 text-center">
                  <button
                    onClick={() => supprimerGrossesse(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    {getTranslation("supprimer", language)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={ajouterGrossesse}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
        >
          + {getTranslation("ajouterGrossesse", language)}
        </button>
      </div>
    </div>
  ),
},
{
  titre: getTranslation("sectionYBilans", language),
  contenu: (
    <div className="p-4 border rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">{getTranslation("date", language)}</th>
              <th className="border p-2">{getTranslation("hb", language)}</th>
              <th className="border p-2">{getTranslation("vgm", language)}</th>
              <th className="border p-2">{getTranslation("ccmh", language)}</th>
              <th className="border p-2">{getTranslation("gb", language)}</th>
              <th className="border p-2">{getTranslation("neutrophiles", language)}</th>
              <th className="border p-2">{getTranslation("lymphocytes", language)}</th>
              <th className="border p-2">{getTranslation("plaquettes", language)}</th>
              <th className="border p-2">{getTranslation("alat", language)}</th>
              <th className="border p-2">{getTranslation("asat", language)}</th>
              <th className="border p-2">{getTranslation("glycemie", language)}</th>
              <th className="border p-2">{getTranslation("creat", language)}</th>
              <th className="border p-2">{getTranslation("aghbs", language)}</th>
              <th className="border p-2">{getTranslation("tb_lam", language)}</th>
              <th className="border p-2">{getTranslation("ag_crypto", language)}</th>
              <th className="border p-2">{getTranslation("genexpert", language)}</th>
              <th className="border p-2">{getTranslation("proteinurie", language)}</th>
              <th className="border p-2">{getTranslation("chol_total", language)}</th>
              <th className="border p-2">{getTranslation("hdl", language)}</th>
              <th className="border p-2">{getTranslation("ldl", language)}</th>
              <th className="border p-2">{getTranslation("triglycerides", language)}</th>
              <th className="border p-2">{getTranslation("depistage_col", language)}</th>
              <th className="border p-2">{getTranslation("syphilis", language)}</th>
              <th className="border p-2">{getTranslation("actions", language)}</th>
            </tr>
          </thead>
          <tbody>
            {bilans.map((b, i) => (
              <tr key={i}>
                <td className="border p-2">
                  <input
                    type="date"
                    value={b.date}
                    onChange={(e) => modifierBilan(i, "date", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>

                {[
                  "hb", "vgm", "ccmh", "gb", "neutrophiles",
                  "lymphocytes", "plaquettes", "alat", "asat",
                  "glycemie", "creat", "aghbs", "tb_lam",
                  "ag_crypto", "genexpert", "proteinurie",
                  "chol_total", "hdl", "ldl", "triglycerides",
                  "depistage_col", "syphilis"
                ].map((field) => (
                  <td key={field} className="border p-2">
                    <input
                      type="text"
                      value={b[field]}
                      onChange={(e) => modifierBilan(i, field, e.target.value)}
                      className="w-full border rounded p-1"
                      placeholder={getTranslation(field, language)}
                    />
                  </td>
                ))}

                <td className="border p-2 text-center">
                  <button
                    onClick={() => supprimerBilan(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    {getTranslation("supprimer", language)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={ajouterBilan}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
      >
        + {getTranslation("ajouterBilan", language)}
      </button>
    </div>
  ),
},
{
  titre: getTranslation("sectionXTb", language),
  contenu: (
    <div className="p-4 border rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">{getTranslation("date", language)}</th>
              <th className="border p-2">{getTranslation("debutTraitement", language)}</th>
              <th className="border p-2">{getTranslation("finTraitement", language)}</th>
              <th className="border p-2">{getTranslation("issuTraitement", language)}</th>
              <th className="border p-2">{getTranslation("actions", language)}</th>
            </tr>
          </thead>
          <tbody>
            {tbFiches.map((f, i) => (
              <tr key={i}>
                <td className="border p-2">
                  <input
                    type="date"
                    value={f.date}
                    onChange={(e) => modifierTbFiche(i, "date", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="date"
                    value={f.debut}
                    onChange={(e) => modifierTbFiche(i, "debut", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="date"
                    value={f.fin}
                    onChange={(e) => modifierTbFiche(i, "fin", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={f.issu}
                    onChange={(e) => modifierTbFiche(i, "issu", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => supprimerTbFiche(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    {getTranslation("supprimer", language)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={ajouterTbFiche}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
      >
        + {getTranslation("ajouterFiche", language)}
      </button>
    </div>
  ),
},
{
  titre: getTranslation("sectionXIIImmuno", language),
  contenu: (
    <div className="p-4 border rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">{getTranslation("datePrelevement", language)}</th>
              <th className="border p-2">{getTranslation("dateResultatCv", language)}</th>
              <th className="border p-2">{getTranslation("dateCd4", language)}</th>
              <th className="border p-2">{getTranslation("resultatCd4", language)}</th>
              <th className="border p-2">{getTranslation("actions", language)}</th>
            </tr>
          </thead>
          <tbody>
            {suiviss.map((s, i) => (
              <tr key={i}>
                <td className="border p-2">
                  <input
                    type="date"
                    value={s.datePrelevement}
                    onChange={(e) =>
                      modifierSuiviImmino(i, "datePrelevement", e.target.value)
                    }
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="date"
                    value={s.dateResultat}
                    onChange={(e) =>
                      modifierSuiviImmino(i, "dateResultat", e.target.value)
                    }
                    className="w-full border rounded p-1"
                  />
                  <input
                    type="number"
                    value={s.resultatCV}
                    onChange={(e) =>
                      modifierSuiviImmino(i, "resultatCV", e.target.value)
                    }
                    className="w-full border rounded p-1 mt-1"
                    placeholder={getTranslation("resultatCV", language)}
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="date"
                    value={s.dateCD4}
                    onChange={(e) =>
                      modifierSuiviImmino(i, "dateCD4", e.target.value)
                    }
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <select
                    value={s.cd4Categorie}
                    onChange={(e) =>
                      modifierSuiviImmino(i, "cd4Categorie", e.target.value)
                    }
                    className="w-full border rounded p-1"
                  >
                    <option value="">{getTranslation("choisir", language)}</option>
                    <option value=">=200">{getTranslation("cd4Sup200", language)}</option>
                    <option value="<200">{getTranslation("cd4Inf200", language)}</option>
                  </select>
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => supprimerSuiviImmino(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    {getTranslation("supprimer", language)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={ajouterSuiviImmino}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
      >
        + {getTranslation("ajouterSuivi", language)}
      </button>
    </div>
  ),
}
,{
   titre: getTranslation("sectionXFicheSuivi", language),
   contenu: (
     <div className="p-4 border rounded-lg">
       <div className="overflow-x-auto">
         <table className="min-w-max border-collapse text-sm">
           <thead>
             <tr className="bg-gray-100">
               <th className="border p-2">{getTranslation("date", language)}</th>
               <th className="border p-2">{getTranslation("taille", language)}</th>
               <th className="border p-2">
                 {getTranslation("poids", language)}
                 <p>....................</p>
                 <p>{getTranslation("imcZscore", language)}</p>
               </th>
               <th className="border p-2">{getTranslation("temperature", language)}</th>
               <th className="border p-2">
                 {getTranslation("ta", language)}
                 <p>.................</p>
                 <p>{getTranslation("pouls", language)}</p>
               </th>
               <th className="border p-2">
                 {getTranslation("rechercheTB", language)}
                 <p>............................................</p>
                 <p>{getTranslation("resultatTB", language)}</p>
               </th>
               <th className="border p-2">
                 {getTranslation("tpt", language)}
                 <p>............................................</p>
                 <p>{getTranslation("etatTpt", language)}</p>
               </th>
               <th className="border p-2">
                 {getTranslation("autresPathologies", language)}
                 <p>....................</p>
                 <p>{getTranslation("dateAutrePathologie", language)}</p>
               </th>
               <th className="border p-2">{getTranslation("cotrimoxazole", language)}</th>
               <th className="border p-2">{getTranslation("actions", language)}</th>
             </tr>
           </thead>
           <tbody>
             {fiches.map((f, i) => (
               <tr key={i}>
                 <td className="border p-2">
                   <input
                     type="date"
                     value={f.date}
                     onChange={(e) => modifierFiche(i, "date", e.target.value)}
                     className="w-full border rounded p-1"
                   />
                 </td>
                 <td className="border p-2">
                   <input
                     type="number"
                     value={f.taille}
                     onChange={(e) => modifierFiche(i, "taille", e.target.value)}
                     className="w-full border rounded p-1"
                     placeholder={getTranslation("taille", language)}
                   />
                 </td>
                 <td className="border p-2">
                   <input
                     type="number"
                     value={f.poids}
                     onChange={(e) => modifierFiche(i, "poids", e.target.value)}
                     className="w-full border rounded p-1"
                     placeholder={getTranslation("poids", language)}
                   />
                   <input
                     type="text"
                     value={f.imc}
                     onChange={(e) => modifierFiche(i, "imc", e.target.value)}
                     className="w-full border rounded p-1 mt-1"
                     placeholder={getTranslation("imcZscore", language)}
                   />
                 </td>
                 <td className="border p-2">
                   <input
                     type="number"
                     value={f.temperature}
                     onChange={(e) => modifierFiche(i, "temperature", e.target.value)}
                     className="w-full border rounded p-1"
                     placeholder={getTranslation("temperature", language)}
                   />
                 </td>
                 <td className="border p-2">
                   <input
                     type="text"
                     value={f.ta}
                     onChange={(e) => modifierFiche(i, "ta", e.target.value)}
                     className="w-full border rounded p-1"
                     placeholder={getTranslation("ta", language)}
                   />
                   <input
                     type="number"
                     value={f.pouls}
                     onChange={(e) => modifierFiche(i, "pouls", e.target.value)}
                     className="w-full border rounded p-1 mt-1"
                     placeholder={getTranslation("pouls", language)}
                   />
                 </td>

                 <td className="border p-2">
                   <select
                     value={f.rechercheTB}
                     onChange={(e) => modifierFiche(i, "rechercheTB", e.target.value)}
                     className="w-full border rounded p-1"
                   >
                     <option value="">{getTranslation("choisir", language)}</option>
                     <option value="0">{getTranslation("oui", language)}</option>
                     <option value="1">{getTranslation("non", language)}</option>
                   </select>

                   <select
                     value={f.resultatTB}
                     onChange={(e) => modifierFiche(i, "resultatTB", e.target.value)}
                     className="w-full border rounded p-1 mt-1"
                   >
                     <option value="">{getTranslation("choisir", language)}</option>
                     <option value="0">{getTranslation("tbNonPresume", language)}</option>
                     <option value="1">{getTranslation("tbSuspect", language)}</option>
                     <option value="2">{getTranslation("tbConfirme", language)}</option>
                   </select>
                 </td>

                 <td className="border p-2">
                   <select
                     value={f.tpt}
                     onChange={(e) => modifierFiche(i, "tpt", e.target.value)}
                     className="w-full border rounded p-1"
                   >
                     <option value="">{getTranslation("choisir", language)}</option>
                     <option value="0">{getTranslation("non", language)}</option>
                     <option value="1">{getTranslation("tptDebut", language)}</option>
                     <option value="2">{getTranslation("tptEnCours", language)}</option>
                     <option value="3">{getTranslation("tptFin", language)}</option>
                   </select>
                 </td>

                 <td className="border p-2">
                   <input
                     type="text"
                     value={f.autresPathologies}
                     onChange={(e) => modifierFiche(i, "autresPathologies", e.target.value)}
                     className="w-full border rounded p-1"
                     placeholder={getTranslation("autresPathologies", language)}
                   />
                   <input
                     type="date"
                     value={f.dateAutrePatholo}
                     onChange={(e) => modifierFiche(i, "dateAutrePatholo", e.target.value)}
                     className="w-full border rounded p-1 mt-1"
                   />
                 </td>

                 <td className="border p-2">
                   <select
                     value={f.cotrimoxazole}
                     onChange={(e) => modifierFiche(i, "cotrimoxazole", e.target.value)}
                     className="w-full border rounded p-1"
                   >
                     <option value="">{getTranslation("choisir", language)}</option>
                     <option value="0">{getTranslation("oui", language)}</option>
                     <option value="1">{getTranslation("non", language)}</option>
                   </select>
                 </td>

                 <td className="border p-2 text-center">
                   <button
                     onClick={() => supprimerFiche(i)}
                     className="px-2 py-1 bg-red-500 text-white rounded"
                   >
                     {getTranslation("supprimer", language)}
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>

       <button
         onClick={ajouterFiche}
         className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
       >
         + {getTranslation("ajouterFiche", language)}
       </button>
     </div>
   ),
 }
,
       {
         titre: "Section X : Suivi thérapeutique ARV",
         contenu: (
           <div className="p-4 border rounded-lg">
             <div className="overflow-x-auto">
               <table className="min-w-max border-collapse text-sm">
                 <thead>
                   <tr className="bg-gray-100">
                     <th className="border p-2">Date (visite)</th>
                     <th className="border p-2">
                       ARV<br/>0=Pas / 1=Sous / 2=Chgt ligne / 3=Substitution
                     </th>
                     <th className="border p-2">
                       Si 2 : préciser<br/>1=Ligne2 / 2=Ligne3
                     </th>
                     <th className="border p-2">Protocole</th>
                     <th className="border p-2">
                       Si substitution : motif<br/>1=Toxicité 2=Rupture 3=Autres
                     </th>
                     <th className="border p-2">Si 3 : préciser</th>
                     <th className="border p-2">Stade clinique OMS</th>
                     <th className="border p-2">
                       Observance<br/>0=Oui 1=Non
                     </th>
                     <th className="border p-2">
                       Éval. nutritionnelle<br/>1=Maigreur 2=Bon 3=Surpoids 4=Obésité
                     </th>
                     <th className="border p-2">
                       Classification<br/>
                       1=Bien portant 2=MVA 3=Stable 4=Non stable
                     </th>
                     <th className="border p-2">
                       Modèle de soins diff. (n°)
                     </th>
                     <th className="border p-2">Date prochain RDV</th>
                     <th className="border p-2">Actions</th>
                   </tr>
                 </thead>

                 <tbody>
                   {suiviArvs.map((row, i) => (
                     <tr key={i}>
                       <td className="border p-2">
                         <input
                           type="date"
                           value={row.dateVisite}
                           onChange={(e) => modifierSuiviArv(i, "dateVisite", e.target.value)}
                           className="w-full border rounded p-1"
                         />
                       </td>

                       <td className="border p-2">
                         <select
                           value={row.situationArv}
                           onChange={(e) => modifierSuiviArv(i, "situationArv", e.target.value)}
                           className="w-full border rounded p-1"
                         >
                           <option value="">--</option>
                           <option value="0">0 = Pas sous ARV</option>
                           <option value="1">1 = Sous ARV</option>
                           <option value="2">2 = Changement de ligne</option>
                           <option value="3">3 = Substitution de molécule</option>
                         </select>
                       </td>

                       <td className="border p-2">
                         <select
                           value={row.changementLignePreciser}
                           onChange={(e) =>
                             modifierSuiviArv(i, "changementLignePreciser", e.target.value)
                           }
                           className="w-full border rounded p-1"
                           disabled={row.situationArv !== "2"}
                         >
                           <option value="">--</option>
                           <option value="1">1 = Ligne 2</option>
                           <option value="2">2 = Ligne 3</option>
                         </select>
                       </td>

                       <td className="border p-2">
                         <input
                           type="text"
                           value={row.protocole}
                           onChange={(e) => modifierSuiviArv(i, "protocole", e.target.value)}
                           className="w-full border rounded p-1"
                         />
                       </td>

                       <td className="border p-2">
                         <select
                           value={row.substitutionMotif}
                           onChange={(e) =>
                             modifierSuiviArv(i, "substitutionMotif", e.target.value)
                           }
                           className="w-full border rounded p-1"
                           disabled={row.situationArv !== "3"}
                         >
                           <option value="">--</option>
                           <option value="1">1 = Toxicité / effets secondaires</option>
                           <option value="2">2 = Rupture de stock de médicaments</option>
                           <option value="3">3 = Autres</option>
                         </select>
                       </td>

                       <td className="border p-2">
                         <input
                           type="text"
                           value={row.substitutionPrecision}
                           onChange={(e) =>
                             modifierSuiviArv(i, "substitutionPrecision", e.target.value)
                           }
                           className="w-full border rounded p-1"
                           placeholder="Préciser si motif = 3"
                           disabled={row.situationArv !== "3" || row.substitutionMotif !== "3"}
                         />
                       </td>

                       <td className="border p-2">
                         <select
                           value={row.stadeCliniqueOms}
                           onChange={(e) => modifierSuiviArv(i, "stadeCliniqueOms", e.target.value)}
                           className="w-full border rounded p-1"
                         >
                           <option value="">--</option>
                           <option value="1">1</option>
                           <option value="2">2</option>
                           <option value="3">3</option>
                           <option value="4">4</option>
                         </select>
                       </td>

                       <td className="border p-2">
                         <select
                           value={row.observanceCorrecte}
                           onChange={(e) =>
                             modifierSuiviArv(i, "observanceCorrecte", e.target.value)
                           }
                           className="w-full border rounded p-1"
                         >
                           <option value="">--</option>
                           <option value="0">0 = Oui</option>
                           <option value="1">1 = Non</option>
                         </select>
                       </td>

                       <td className="border p-2">
                         <select
                           value={row.evaluationNutritionnelle}
                           onChange={(e) =>
                             modifierSuiviArv(i, "evaluationNutritionnelle", e.target.value)
                           }
                           className="w-full border rounded p-1"
                         >
                           <option value="">--</option>
                           <option value="1">1 = Maigreur</option>
                           <option value="2">2 = Bon état nutritionnel</option>
                           <option value="3">3 = Surpoids</option>
                           <option value="4">4 = Obésité</option>
                         </select>
                       </td>

                       <td className="border p-2">
                         <select
                           value={row.classification}
                           onChange={(e) =>
                             modifierSuiviArv(i, "classification", e.target.value)
                           }
                           className="w-full border rounded p-1"
                         >
                           <option value="">--</option>
                           <option value="1">1 = Bien portant (à l’enrôlement)</option>
                           <option value="2">2 = MVA (à l’enrôlement)</option>
                           <option value="3">3 = Stable (après 6 mois de TAR)</option>
                           <option value="4">4 = Non stable (après 6 mois de TAR)</option>
                         </select>
                       </td>

                       <td className="border p-2">
                         <input
                           type="text"
                           value={row.modeleSoinsNumero}
                           onChange={(e) =>
                             modifierSuiviArv(i, "modeleSoinsNumero", e.target.value)
                           }
                           className="w-full border rounded p-1"
                           placeholder="N° modèle"
                         />
                       </td>

                       <td className="border p-2">
                         <input
                           type="date"
                           value={row.prochainRdv}
                           onChange={(e) => modifierSuiviArv(i, "prochainRdv", e.target.value)}
                           className="w-full border rounded p-1"
                         />
                       </td>

                       <td className="border p-2 text-center">
                         <button
                           onClick={() => supprimerSuiviArv(i)}
                           className="px-2 py-1 bg-red-500 text-white rounded"
                         >
                           Suppr
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             <button
               onClick={ajouterSuiviArv}
               className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
             >
               + Ajouter une ligne
             </button>
           </div>
         ),
       }



  ];

  const etapeSuivante = () => {
    if (etape < sections.length - 1) setEtape(etape + 1);
  };

  const etapePrecedente = () => {
    if (etape > 0) setEtape(etape - 1);
  };

   const annuler = () => {
     if (window.confirm("Voulez-vous annuler et réinitialiser le formulaire ?")) {
       setDonneesFormulaire({
         profession: "",
         statutFamilial: "",
         personneContact: "",
         telephoneContact: "",
         dateTest: "",
         dateConfirmation: "",
         lieuTest: "",
         resultat: "",
         soutienNom: "",
         soutienPrenoms: "",
         soutienLien: "",
         soutienTelephone: "",
         soutienAdresse: "",
         portesEntree: [],
         reference: "Non",
         dateReference: "",
         siteOrigine: "",
         arv: "",
         dateDebutArv: "",
         protocoleInitialArv: "",
         protocoleActuelArv: "",
         nbGrossessesPtme: "",
         contraception: "",
         prep: "",
         tuberculose: "",
         maladiesChroniques: [],
         autresMaladiesChroniques: "",
         stadeOms: "",
         dateDebutTar: "",
         protocoleInitialTar: "",
       });
       setEtape(0); // retour au début
     }
   };

   return (


     <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded-lg">
       <div className="p-4">
            {/* Sélecteur de langue */}

              </div>
       <h2 className="text-xl font-bold mb-4">{sections[etape].titre}</h2>

       <AnimatePresence mode="wait">
         <motion.div
           key={etape}
           initial={{ opacity: 0, x: 50 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -50 }}
           transition={{ duration: 0.3 }}
         >
           {sections[etape].contenu}
         </motion.div>
       </AnimatePresence>

     <div className="w-full flex justify-between items-center mt-6">
       {/* Bouton précédent à gauche */}
       <button
         onClick={etapePrecedente}
         disabled={etape === 0}
         className="flex items-center px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
       >
         <ArrowLeft className="mr-2" /> Précédent
       </button>

       {/* Bouton suivant ou soumettre à droite */}
       {etape < sections.length - 1 ? (
         <button
           onClick={etapeSuivante}
           className="flex items-center px-4 py-2 bg-blue-500 text-white rounded"
         >
           Suivant <ArrowRight className="ml-2" />
         </button>
       ) : (
         <button
           onClick={validerEtSoumettre}
           disabled={biometrieIris.biometricStatus !== "CAPTURED"}
           className={`px-4 py-2 rounded ${
             biometrieIris.biometricStatus === "CAPTURED"
               ? "bg-green-600 text-white hover:bg-green-700"
               : "bg-gray-400 text-gray-700 cursor-not-allowed"
           }`}
         >
           {biometrieIris.biometricStatus === "CAPTURED"
             ? "Soumettre avec identification iris"
             : "Capturez l'iris d'abord"}
         </button>
       )}
     </div>

    {/* bouton retour supprimé */}


       </div>

   );
 }
