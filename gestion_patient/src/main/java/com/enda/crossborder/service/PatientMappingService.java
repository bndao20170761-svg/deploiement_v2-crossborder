package com.enda.crossborder.service;

import com.enda.crossborder.dto.PatientDataDTO;
import com.enda.crossborder.entity.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PatientMappingService {

    /**
     * Convertit le JSON reçu de a_reference_front en entités JPA
     */
    public DossierPatient mapToDossierPatient(PatientDataDTO patientDataDTO) {
        log.info("Début du mapping pour le dossier: {}", patientDataDTO.getCodeDossier());
        
        DossierPatient dossierPatient = new DossierPatient();
        
        // Informations principales
        dossierPatient.setCodeDossier(patientDataDTO.getCodeDossier());
        dossierPatient.setCodePatient(patientDataDTO.getCodePatient());
        dossierPatient.setNomComplet(patientDataDTO.getNomComplet());
        dossierPatient.setDoctorCreateNom(patientDataDTO.getDoctorCreateNom());
        dossierPatient.setIdentificationBiom(patientDataDTO.getIdentificationBiom());
        
        // Timestamps
        dossierPatient.setCreatedAt(LocalDate.now());
        dossierPatient.setUpdatedAt(LocalDate.now());
        
        // Extraire les données de la première page (si existante)
        if (patientDataDTO.getPages() != null && !patientDataDTO.getPages().isEmpty()) {
            PatientDataDTO.PageDataDTO page = patientDataDTO.getPages().get(0);
            mapPageDataToDossierPatient(page, dossierPatient);
            
            // Mapper les données imbriquées
            mapNestedData(page, dossierPatient);
        }
        
        log.info("Mapping terminé pour le dossier: {}", patientDataDTO.getCodeDossier());
        return dossierPatient;
    }
    
    /**
     * Map les données de la page vers l'entité principale
     */
    private void mapPageDataToDossierPatient(PatientDataDTO.PageDataDTO page, DossierPatient dossierPatient) {
        // Informations familiales
        dossierPatient.setPereNomPrenoms(page.getPereNomPrenoms());
        dossierPatient.setPereStatut(page.getPereStatut());
        dossierPatient.setPereNiveauInstruction(page.getPereNiveauInstruction());
        dossierPatient.setPereProfession(page.getPereProfession());
        dossierPatient.setPereStatutVih(page.getPereStatutVih());
        dossierPatient.setPereTelephone(page.getPereTelephone());
        
        dossierPatient.setMereNomPrenoms(page.getMereNomPrenoms());
        dossierPatient.setMereStatut(page.getMereStatut());
        dossierPatient.setMereNiveauInstruction(page.getMereNiveauInstruction());
        dossierPatient.setMereProfession(page.getMereProfession());
        dossierPatient.setMereStatutVih(page.getMereStatutVih());
        dossierPatient.setMereTelephone(page.getMereTelephone());
        
        // Naissance
        dossierPatient.setNaissanceStructure(page.getNaissanceStructure());
        dossierPatient.setPoidsNaissance(page.getPoidsNaissance());
        dossierPatient.setTailleNaissance(page.getTailleNaissance());
        dossierPatient.setPerimetreCranien(page.getPerimetreCranien());
        dossierPatient.setApgar(page.getApgar());
        
        // Référence
        dossierPatient.setPortesEntree(page.getPortesEntree());
        dossierPatient.setReference(page.getReference());
        dossierPatient.setDateReference(page.getDateReference());
        dossierPatient.setSiteOrigine(page.getSiteOrigine());
        
        // Test VIH
        dossierPatient.setDateTest(page.getDateTest());
        dossierPatient.setDateConfirmation(page.getDateConfirmation());
        dossierPatient.setLieuTest(page.getLieuTest());
        dossierPatient.setResultat(page.getResultat());
        
        // ETP
        dossierPatient.setDateDebutETP(page.getDateDebutETP());
        dossierPatient.setAgeETP(page.getAgeETP());
        dossierPatient.setAnnonceComplete(page.getAnnonceComplete());
        dossierPatient.setAgeAnnonce(page.getAgeAnnonce());
        
        // Vaccination
        dossierPatient.setVaccins(page.getVaccins());
        dossierPatient.setAutresVaccins(page.getAutresVaccins());
        
        // Prophylaxie enfant
        dossierPatient.setEnfantProphylaxieArvNaissance(page.getEnfantProphylaxieArvNaissance());
        dossierPatient.setEnfantProphylaxieCotrimoxazole(page.getEnfantProphylaxieCotrimoxazole());
        dossierPatient.setEnfantAlimentation(page.getEnfantAlimentation());
        dossierPatient.setEnfantSevrageAgeMois(page.getEnfantSevrageAgeMois());
        dossierPatient.setEnfantNumeroSeropositif(page.getEnfantNumeroSeropositif());
        
        // Mère - PTME
        dossierPatient.setMereTritherapieGrossesse(page.getMereTritherapieGrossesse());
        
        // ARV
        dossierPatient.setDateDebutArv(page.getDateDebutArv());
        dossierPatient.setProtocoleInitialArv(page.getProtocoleInitialArv());
        dossierPatient.setProtocoleActuelArv(page.getProtocoleActuelArv());
        dossierPatient.setArvStadeOmsInitial(page.getArvStadeOmsInitial());
        dossierPatient.setStadeOmsInitial(page.getStadeOmsInitial());
        
        // Répondants
        dossierPatient.setRepondant1Nom(page.getRepondant1Nom());
        dossierPatient.setRepondant1Lien(page.getRepondant1Lien());
        dossierPatient.setRepondant1Niveau(page.getRepondant1Niveau());
        dossierPatient.setRepondant1Profession(page.getRepondant1Profession());
        dossierPatient.setRepondant1Tel(page.getRepondant1Tel());
        
        dossierPatient.setRepondant2Nom(page.getRepondant2Nom());
        dossierPatient.setRepondant2Lien(page.getRepondant2Lien());
        dossierPatient.setRepondant2Niveau(page.getRepondant2Niveau());
        dossierPatient.setRepondant2Profession(page.getRepondant2Profession());
        dossierPatient.setRepondant2Tel(page.getRepondant2Tel());
        
        // Tuberculose
        dossierPatient.setTuberculose(page.getTuberculose());
        dossierPatient.setAutresAnt(page.getAutresAnt());
        
        // Patient
        dossierPatient.setProfession(page.getProfession());
        dossierPatient.setStatutFamilial(page.getStatutFamilial());
        dossierPatient.setPersonneContact(page.getPersonneContact());
        dossierPatient.setTelephoneContact(page.getTelephoneContact());
        
        // Soutien
        dossierPatient.setSoutienNom(page.getSoutienNom());
        dossierPatient.setSoutienPrenoms(page.getSoutienPrenoms());
        dossierPatient.setSoutienLien(page.getSoutienLien());
        dossierPatient.setSoutienTelephone(page.getSoutienTelephone());
        dossierPatient.setSoutienAdresse(page.getSoutienAdresse());
        
        // OMS
        dossierPatient.setStadeOms(page.getStadeOms());
        
        // TAR
        dossierPatient.setDateDebutTar(page.getDateDebutTar());
        dossierPatient.setProtocoleInitialTar(page.getProtocoleInitialTar());
        dossierPatient.setNbGrossessesPtme(page.getNbGrossessesPtme());
        dossierPatient.setContraception(page.getContraception());
        dossierPatient.setPrep(page.getPrep());
        
        // Maladies chroniques
        dossierPatient.setMaladiesChroniques(page.getMaladiesChroniques());
        dossierPatient.setAutresMaladiesChroniques(page.getAutresMaladiesChroniques());
    }
    
    /**
     * Map les données imbriquées (tableaux)
     */
    private void mapNestedData(PatientDataDTO.PageDataDTO page, DossierPatient dossierPatient) {
        // Index Tests
        if (page.getIndexTests() != null) {
            List<IndexTest> indexTests = page.getIndexTests().stream()
                .map(dto -> mapIndexTest(dto, dossierPatient))
                .collect(Collectors.toList());
            dossierPatient.setIndexTests(indexTests);
        }
        
        // Prise en charge TB
        if (page.getPriseEnChargeTbs() != null) {
            List<PriseEnChargeTB> priseEnChargeTBs = page.getPriseEnChargeTbs().stream()
                .map(dto -> mapPriseEnChargeTB(dto, dossierPatient))
                .collect(Collectors.toList());
            dossierPatient.setPriseEnChargeTBs(priseEnChargeTBs);
        }
        
        // PTME
        if (page.getPtmes() != null) {
            List<PTME> ptmes = page.getPtmes().stream()
                .map(dto -> mapPTME(dto, dossierPatient))
                .collect(Collectors.toList());
            dossierPatient.setPtmes(ptmes);
        }
        
        // Suivi immunovirologique
        if (page.getSuiviImmunovirologiques() != null) {
            List<SuiviImmunovirologique> suiviImmunovirologiques = page.getSuiviImmunovirologiques().stream()
                .map(dto -> mapSuiviImmunovirologique(dto, dossierPatient))
                .collect(Collectors.toList());
            dossierPatient.setSuiviImmunovirologiques(suiviImmunovirologiques);
        }
        
        // Suivi pathologique
        if (page.getSuiviPathologiques() != null) {
            List<SuiviPathologique> suiviPathologiques = page.getSuiviPathologiques().stream()
                .map(dto -> mapSuiviPathologique(dto, dossierPatient))
                .collect(Collectors.toList());
            dossierPatient.setSuiviPathologiques(suiviPathologiques);
        }
        
        // Suivi ARV
        if (page.getSuiviARVs() != null) {
            List<SuiviARV> suiviARVs = page.getSuiviARVs().stream()
                .map(dto -> mapSuiviARV(dto, dossierPatient))
                .collect(Collectors.toList());
            dossierPatient.setSuiviARVs(suiviARVs);
        }
        
        // Dépistage familial
        if (page.getDepistageFamiliales() != null) {
            List<DepistageFamilial> depistageFamiliales = page.getDepistageFamiliales().stream()
                .map(dto -> mapDepistageFamilial(dto, dossierPatient))
                .collect(Collectors.toList());
            dossierPatient.setDepistageFamiliales(depistageFamiliales);
        }
    }
    
    // Méthodes de mapping pour les entités imbriquées
    private IndexTest mapIndexTest(PatientDataDTO.IndexTestDTO dto, DossierPatient dossierPatient) {
        IndexTest entity = new IndexTest();
        entity.setNom(dto.getNom());
        entity.setType(dto.getType());
        entity.setAge(dto.getAge());
        entity.setSexe(dto.getSexe());
        entity.setStatut(dto.getStatut());
        entity.setResultat(dto.getResultat());
        entity.setSoins(dto.getSoins());
        entity.setIdentifiant(dto.getIdentifiant());
        entity.setDossierPatient(dossierPatient);
        return entity;
    }
    
    private PriseEnChargeTB mapPriseEnChargeTB(PatientDataDTO.PriseEnChargeTBDTO dto, DossierPatient dossierPatient) {
        PriseEnChargeTB entity = new PriseEnChargeTB();
        entity.setDate(dto.getDate());
        entity.setDebut(dto.getDebut());
        entity.setFin(dto.getFin());
        entity.setIssu(dto.getIssu());
        entity.setDossierPatient(dossierPatient);
        return entity;
    }
    
    private PTME mapPTME(PatientDataDTO.PTMEDTO dto, DossierPatient dossierPatient) {
        PTME entity = new PTME();
        entity.setDateDiagnostic(dto.getDateDiagnostic());
        entity.setRangCpn(dto.getRangCpn());
        entity.setDateProbableAcc(dto.getDateProbableAcc());
        entity.setIssue(dto.getIssue());
        entity.setDateReelle(dto.getDateReelle());
        entity.setModeAcc(dto.getModeAcc());
        entity.setAllaitement(dto.getAllaitement());
        entity.setProphylaxie(dto.getProphylaxie());
        entity.setProtocole(dto.getProtocole());
        entity.setDateDebutProtocole(dto.getDateDebutProtocole());
        entity.setPcr1(dto.getPcr1());
        entity.setDatePrelPcr(dto.getDatePrelPcr());
        entity.setResultatPcr(dto.getResultatPcr());
        entity.setSerologie(dto.getSerologie());
        entity.setDatePrelSero(dto.getDatePrelSero());
        entity.setResultatSero(dto.getResultatSero());
        entity.setDossierPatient(dossierPatient);
        return entity;
    }
    
    private SuiviImmunovirologique mapSuiviImmunovirologique(PatientDataDTO.SuiviImmunovirologiqueDTO dto, DossierPatient dossierPatient) {
        SuiviImmunovirologique entity = new SuiviImmunovirologique();
        entity.setDate(dto.getDate());
        entity.setCd4(dto.getCd4());
        entity.setChargeVirale(dto.getChargeVirale());
        entity.setCd4Pourcentage(dto.getCd4Pourcentage());
        entity.setStadeOms(dto.getStadeOms());
        entity.setObservations(dto.getObservations());
        entity.setDossierPatient(dossierPatient);
        return entity;
    }
    
    private SuiviPathologique mapSuiviPathologique(PatientDataDTO.SuiviPathologiqueDTO dto, DossierPatient dossierPatient) {
        SuiviPathologique entity = new SuiviPathologique();
        entity.setDate(dto.getDate());
        entity.setTaille(dto.getTaille());
        entity.setPoids(dto.getPoids());
        entity.setImc(dto.getImc());
        entity.setTa(dto.getTa());
        entity.setTemperature(dto.getTemperature());
        entity.setPouls(dto.getPouls());
        entity.setRechercheTB(dto.getRechercheTB());
        entity.setResultatTB(dto.getResultatTB());
        entity.setTpt(dto.getTpt());
        entity.setAutresPathologies(dto.getAutresPathologies());
        entity.setCotrimoxazole(dto.getCotrimoxazole());
        entity.setDossierPatient(dossierPatient);
        return entity;
    }
    
    private SuiviARV mapSuiviARV(PatientDataDTO.SuiviARVDTO dto, DossierPatient dossierPatient) {
        SuiviARV entity = new SuiviARV();
        entity.setDateVisite(dto.getDateVisite());
        entity.setSituationArv(dto.getSituationArv());
        entity.setChangementLignePreciser(dto.getChangementLignePreciser());
        entity.setProtocole(dto.getProtocole());
        entity.setSubstitutionMotif(dto.getSubstitutionMotif());
        entity.setSubstitutionPrecision(dto.getSubstitutionPrecision());
        entity.setStadeCliniqueOms(dto.getStadeCliniqueOms());
        entity.setObservanceCorrecte(dto.getObservanceCorrecte());
        entity.setEvaluationNutritionnelle(dto.getEvaluationNutritionnelle());
        entity.setClassification(dto.getClassification());
        entity.setModeleSoinsNumero(dto.getModeleSoinsNumero());
        entity.setProchainRdv(dto.getProchainRdv());
        entity.setDossierPatient(dossierPatient);
        return entity;
    }
    
    private DepistageFamilial mapDepistageFamilial(PatientDataDTO.DepistageFamilialDTO dto, DossierPatient dossierPatient) {
        DepistageFamilial entity = new DepistageFamilial();
        entity.setNom(dto.getNom());
        entity.setType(dto.getType());
        entity.setAge(dto.getAge());
        entity.setSexe(dto.getSexe());
        entity.setStatut(dto.getStatut());
        entity.setResultat(dto.getResultat());
        entity.setSoins(dto.getSoins());
        entity.setIdentifiant(dto.getIdentifiant());
        entity.setDossierPatient(dossierPatient);
        return entity;
    }
    
    /**
     * Convertit l'entité JPA en DTO pour la réponse
     */
    public PatientDataDTO mapToPatientDataDTO(DossierPatient dossierPatient) {
        PatientDataDTO dto = new PatientDataDTO();
        dto.setCodeDossier(dossierPatient.getCodeDossier());
        dto.setCodePatient(dossierPatient.getCodePatient());
        dto.setNomComplet(dossierPatient.getNomComplet());
        dto.setDoctorCreateNom(dossierPatient.getDoctorCreateNom());
        dto.setIdentificationBiom(dossierPatient.getIdentificationBiom());
        
        List<PatientDataDTO.PageDataDTO> pages = new ArrayList<>();
        PatientDataDTO.PageDataDTO page = new PatientDataDTO.PageDataDTO();
        
        // Mapper tous les champs de l'entité vers le DTO
        mapDossierPatientToPageData(dossierPatient, page);
        
        // Mapper les collections imbriquées
        mapNestedEntitiesToDTO(dossierPatient, page);
        
        pages.add(page);
        dto.setPages(pages);
        
        return dto;
    }
    
    private void mapDossierPatientToPageData(DossierPatient dossierPatient, PatientDataDTO.PageDataDTO page) {
        // Informations familiales
        page.setPereNomPrenoms(dossierPatient.getPereNomPrenoms());
        page.setPereStatut(dossierPatient.getPereStatut());
        page.setPereNiveauInstruction(dossierPatient.getPereNiveauInstruction());
        page.setPereProfession(dossierPatient.getPereProfession());
        page.setPereStatutVih(dossierPatient.getPereStatutVih());
        page.setPereTelephone(dossierPatient.getPereTelephone());
        
        page.setMereNomPrenoms(dossierPatient.getMereNomPrenoms());
        page.setMereStatut(dossierPatient.getMereStatut());
        page.setMereNiveauInstruction(dossierPatient.getMereNiveauInstruction());
        page.setMereProfession(dossierPatient.getMereProfession());
        page.setMereStatutVih(dossierPatient.getMereStatutVih());
        page.setMereTelephone(dossierPatient.getMereTelephone());
        
        // Naissance
        page.setNaissanceStructure(dossierPatient.getNaissanceStructure());
        page.setPoidsNaissance(dossierPatient.getPoidsNaissance());
        page.setTailleNaissance(dossierPatient.getTailleNaissance());
        page.setPerimetreCranien(dossierPatient.getPerimetreCranien());
        page.setApgar(dossierPatient.getApgar());
        
        // Référence
        page.setPortesEntree(dossierPatient.getPortesEntree());
        page.setReference(dossierPatient.getReference());
        page.setDateReference(dossierPatient.getDateReference());
        page.setSiteOrigine(dossierPatient.getSiteOrigine());
        
        // Test VIH
        page.setDateTest(dossierPatient.getDateTest());
        page.setDateConfirmation(dossierPatient.getDateConfirmation());
        page.setLieuTest(dossierPatient.getLieuTest());
        page.setResultat(dossierPatient.getResultat());
        
        // ETP
        page.setDateDebutETP(dossierPatient.getDateDebutETP());
        page.setAgeETP(dossierPatient.getAgeETP());
        page.setAnnonceComplete(dossierPatient.getAnnonceComplete());
        page.setAgeAnnonce(dossierPatient.getAgeAnnonce());
        
        // Vaccination
        page.setVaccins(dossierPatient.getVaccins());
        page.setAutresVaccins(dossierPatient.getAutresVaccins());
        
        // Prophylaxie enfant
        page.setEnfantProphylaxieArvNaissance(dossierPatient.getEnfantProphylaxieArvNaissance());
        page.setEnfantProphylaxieCotrimoxazole(dossierPatient.getEnfantProphylaxieCotrimoxazole());
        page.setEnfantAlimentation(dossierPatient.getEnfantAlimentation());
        page.setEnfantSevrageAgeMois(dossierPatient.getEnfantSevrageAgeMois());
        page.setEnfantNumeroSeropositif(dossierPatient.getEnfantNumeroSeropositif());
        
        // Mère - PTME
        page.setMereTritherapieGrossesse(dossierPatient.getMereTritherapieGrossesse());
        
        // ARV
        page.setDateDebutArv(dossierPatient.getDateDebutArv());
        page.setProtocoleInitialArv(dossierPatient.getProtocoleInitialArv());
        page.setProtocoleActuelArv(dossierPatient.getProtocoleActuelArv());
        page.setArvStadeOmsInitial(dossierPatient.getArvStadeOmsInitial());
        page.setStadeOmsInitial(dossierPatient.getStadeOmsInitial());
        
        // Répondants
        page.setRepondant1Nom(dossierPatient.getRepondant1Nom());
        page.setRepondant1Lien(dossierPatient.getRepondant1Lien());
        page.setRepondant1Niveau(dossierPatient.getRepondant1Niveau());
        page.setRepondant1Profession(dossierPatient.getRepondant1Profession());
        page.setRepondant1Tel(dossierPatient.getRepondant1Tel());
        
        page.setRepondant2Nom(dossierPatient.getRepondant2Nom());
        page.setRepondant2Lien(dossierPatient.getRepondant2Lien());
        page.setRepondant2Niveau(dossierPatient.getRepondant2Niveau());
        page.setRepondant2Profession(dossierPatient.getRepondant2Profession());
        page.setRepondant2Tel(dossierPatient.getRepondant2Tel());
        
        // Tuberculose
        page.setTuberculose(dossierPatient.getTuberculose());
        page.setAutresAnt(dossierPatient.getAutresAnt());
        
        // Patient
        page.setProfession(dossierPatient.getProfession());
        page.setStatutFamilial(dossierPatient.getStatutFamilial());
        page.setPersonneContact(dossierPatient.getPersonneContact());
        page.setTelephoneContact(dossierPatient.getTelephoneContact());
        
        // Soutien
        page.setSoutienNom(dossierPatient.getSoutienNom());
        page.setSoutienPrenoms(dossierPatient.getSoutienPrenoms());
        page.setSoutienLien(dossierPatient.getSoutienLien());
        page.setSoutienTelephone(dossierPatient.getSoutienTelephone());
        page.setSoutienAdresse(dossierPatient.getSoutienAdresse());
        
        // OMS
        page.setStadeOms(dossierPatient.getStadeOms());
        
        // TAR
        page.setDateDebutTar(dossierPatient.getDateDebutTar());
        page.setProtocoleInitialTar(dossierPatient.getProtocoleInitialTar());
        page.setNbGrossessesPtme(dossierPatient.getNbGrossessesPtme());
        page.setContraception(dossierPatient.getContraception());
        page.setPrep(dossierPatient.getPrep());
        
        // Maladies chroniques
        page.setMaladiesChroniques(dossierPatient.getMaladiesChroniques());
        page.setAutresMaladiesChroniques(dossierPatient.getAutresMaladiesChroniques());
    }
    
    private void mapNestedEntitiesToDTO(DossierPatient dossierPatient, PatientDataDTO.PageDataDTO page) {
        // Index Tests
        if (dossierPatient.getIndexTests() != null) {
            List<PatientDataDTO.IndexTestDTO> indexTests = dossierPatient.getIndexTests().stream()
                .map(this::mapIndexTestToDTO)
                .collect(Collectors.toList());
            page.setIndexTests(indexTests);
        }
        
        // Prise en charge TB
        if (dossierPatient.getPriseEnChargeTBs() != null) {
            List<PatientDataDTO.PriseEnChargeTBDTO> priseEnChargeTbs = dossierPatient.getPriseEnChargeTBs().stream()
                .map(this::mapPriseEnChargeTBToDTO)
                .collect(Collectors.toList());
            page.setPriseEnChargeTbs(priseEnChargeTbs);
        }
        
        // PTME
        if (dossierPatient.getPtmes() != null) {
            List<PatientDataDTO.PTMEDTO> ptmes = dossierPatient.getPtmes().stream()
                .map(this::mapPTMEToDTO)
                .collect(Collectors.toList());
            page.setPtmes(ptmes);
        }
        
        // Suivi immunovirologique
        if (dossierPatient.getSuiviImmunovirologiques() != null) {
            List<PatientDataDTO.SuiviImmunovirologiqueDTO> suiviImmunovirologiques = dossierPatient.getSuiviImmunovirologiques().stream()
                .map(this::mapSuiviImmunovirologiqueToDTO)
                .collect(Collectors.toList());
            page.setSuiviImmunovirologiques(suiviImmunovirologiques);
        }
        
        // Suivi pathologique
        if (dossierPatient.getSuiviPathologiques() != null) {
            List<PatientDataDTO.SuiviPathologiqueDTO> suiviPathologiques = dossierPatient.getSuiviPathologiques().stream()
                .map(this::mapSuiviPathologiqueToDTO)
                .collect(Collectors.toList());
            page.setSuiviPathologiques(suiviPathologiques);
        }
        
        // Suivi ARV
        if (dossierPatient.getSuiviARVs() != null) {
            List<PatientDataDTO.SuiviARVDTO> suiviARVs = dossierPatient.getSuiviARVs().stream()
                .map(this::mapSuiviARVToDTO)
                .collect(Collectors.toList());
            page.setSuiviARVs(suiviARVs);
        }
        
        // Dépistage familial
        if (dossierPatient.getDepistageFamiliales() != null) {
            List<PatientDataDTO.DepistageFamilialDTO> depistageFamiliales = dossierPatient.getDepistageFamiliales().stream()
                .map(this::mapDepistageFamilialToDTO)
                .collect(Collectors.toList());
            page.setDepistageFamiliales(depistageFamiliales);
        }
    }
    
    private PatientDataDTO.IndexTestDTO mapIndexTestToDTO(IndexTest entity) {
        PatientDataDTO.IndexTestDTO dto = new PatientDataDTO.IndexTestDTO();
        dto.setId(entity.getId());
        dto.setNom(entity.getNom());
        dto.setType(entity.getType());
        dto.setAge(entity.getAge());
        dto.setSexe(entity.getSexe());
        dto.setStatut(entity.getStatut());
        dto.setResultat(entity.getResultat());
        dto.setSoins(entity.getSoins());
        dto.setIdentifiant(entity.getIdentifiant());
        return dto;
    }
    
    private PatientDataDTO.PriseEnChargeTBDTO mapPriseEnChargeTBToDTO(PriseEnChargeTB entity) {
        PatientDataDTO.PriseEnChargeTBDTO dto = new PatientDataDTO.PriseEnChargeTBDTO();
        dto.setId(entity.getId());
        dto.setDate(entity.getDate());
        dto.setDebut(entity.getDebut());
        dto.setFin(entity.getFin());
        dto.setIssu(entity.getIssu());
        return dto;
    }
    
    private PatientDataDTO.PTMEDTO mapPTMEToDTO(PTME entity) {
        PatientDataDTO.PTMEDTO dto = new PatientDataDTO.PTMEDTO();
        dto.setId(entity.getId());
        dto.setDateDiagnostic(entity.getDateDiagnostic());
        dto.setRangCpn(entity.getRangCpn());
        dto.setDateProbableAcc(entity.getDateProbableAcc());
        dto.setIssue(entity.getIssue());
        dto.setDateReelle(entity.getDateReelle());
        dto.setModeAcc(entity.getModeAcc());
        dto.setAllaitement(entity.getAllaitement());
        dto.setProphylaxie(entity.getProphylaxie());
        dto.setProtocole(entity.getProtocole());
        dto.setDateDebutProtocole(entity.getDateDebutProtocole());
        dto.setPcr1(entity.getPcr1());
        dto.setDatePrelPcr(entity.getDatePrelPcr());
        dto.setResultatPcr(entity.getResultatPcr());
        dto.setSerologie(entity.getSerologie());
        dto.setDatePrelSero(entity.getDatePrelSero());
        dto.setResultatSero(entity.getResultatSero());
        return dto;
    }
    
    private PatientDataDTO.SuiviImmunovirologiqueDTO mapSuiviImmunovirologiqueToDTO(SuiviImmunovirologique entity) {
        PatientDataDTO.SuiviImmunovirologiqueDTO dto = new PatientDataDTO.SuiviImmunovirologiqueDTO();
        dto.setId(entity.getId());
        dto.setDate(entity.getDate());
        dto.setCd4(entity.getCd4());
        dto.setChargeVirale(entity.getChargeVirale());
        dto.setCd4Pourcentage(entity.getCd4Pourcentage());
        dto.setStadeOms(entity.getStadeOms());
        dto.setObservations(entity.getObservations());
        return dto;
    }
    
    private PatientDataDTO.SuiviPathologiqueDTO mapSuiviPathologiqueToDTO(SuiviPathologique entity) {
        PatientDataDTO.SuiviPathologiqueDTO dto = new PatientDataDTO.SuiviPathologiqueDTO();
        dto.setId(entity.getId());
        dto.setDate(entity.getDate());
        dto.setTaille(entity.getTaille());
        dto.setPoids(entity.getPoids());
        dto.setImc(entity.getImc());
        dto.setTa(entity.getTa());
        dto.setTemperature(entity.getTemperature());
        dto.setPouls(entity.getPouls());
        dto.setRechercheTB(entity.getRechercheTB());
        dto.setResultatTB(entity.getResultatTB());
        dto.setTpt(entity.getTpt());
        dto.setAutresPathologies(entity.getAutresPathologies());
        dto.setCotrimoxazole(entity.getCotrimoxazole());
        return dto;
    }
    
    private PatientDataDTO.SuiviARVDTO mapSuiviARVToDTO(SuiviARV entity) {
        PatientDataDTO.SuiviARVDTO dto = new PatientDataDTO.SuiviARVDTO();
        dto.setId(entity.getId());
        dto.setDateVisite(entity.getDateVisite());
        dto.setSituationArv(entity.getSituationArv());
        dto.setChangementLignePreciser(entity.getChangementLignePreciser());
        dto.setProtocole(entity.getProtocole());
        dto.setSubstitutionMotif(entity.getSubstitutionMotif());
        dto.setSubstitutionPrecision(entity.getSubstitutionPrecision());
        dto.setStadeCliniqueOms(entity.getStadeCliniqueOms());
        dto.setObservanceCorrecte(entity.getObservanceCorrecte());
        dto.setEvaluationNutritionnelle(entity.getEvaluationNutritionnelle());
        dto.setClassification(entity.getClassification());
        dto.setModeleSoinsNumero(entity.getModeleSoinsNumero());
        dto.setProchainRdv(entity.getProchainRdv());
        return dto;
    }
    
    private PatientDataDTO.DepistageFamilialDTO mapDepistageFamilialToDTO(DepistageFamilial entity) {
        PatientDataDTO.DepistageFamilialDTO dto = new PatientDataDTO.DepistageFamilialDTO();
        dto.setId(entity.getId());
        dto.setNom(entity.getNom());
        dto.setType(entity.getType());
        dto.setAge(entity.getAge());
        dto.setSexe(entity.getSexe());
        dto.setStatut(entity.getStatut());
        dto.setResultat(entity.getResultat());
        dto.setSoins(entity.getSoins());
        dto.setIdentifiant(entity.getIdentifiant());
        return dto;
    }
}
