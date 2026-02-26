package com.enda.crossborder.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDataDTO {
    
    private String codeDossier;
    private String codePatient;
    private String nomComplet;
    private String doctorCreateNom;
    private String identificationBiom;
    private List<PageDataDTO> pages;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageDataDTO {
        
        // Informations familiales
        private String pereNomPrenoms;
        private String pereStatut;
        private String pereNiveauInstruction;
        private String pereProfession;
        private String pereStatutVih;
        private String pereTelephone;
        
        private String mereNomPrenoms;
        private String mereStatut;
        private String mereNiveauInstruction;
        private String mereProfession;
        private String mereStatutVih;
        private String mereTelephone;
        
        // Naissance
        private String naissanceStructure;
        private Double poidsNaissance;
        private Double tailleNaissance;
        private Double perimetreCranien;
        private String apgar;
        
        // Référence
        private String portesEntree;
        private String reference;
        private LocalDate dateReference;
        private String siteOrigine;
        
        // Test VIH
        private LocalDate dateTest;
        private LocalDate dateConfirmation;
        private String lieuTest;
        private String resultat;
        
        // ETP
        private LocalDate dateDebutETP;
        private Integer ageETP;
        private String annonceComplete;
        private Integer ageAnnonce;
        
        // Vaccination
        private String vaccins;
        private String autresVaccins;
        
        // Prophylaxie enfant
        private String enfantProphylaxieArvNaissance;
        private String enfantProphylaxieCotrimoxazole;
        private String enfantAlimentation;
        private Integer enfantSevrageAgeMois;
        private String enfantNumeroSeropositif;
        
        // Mère - PTME
        private String mereTritherapieGrossesse;
        
        // ARV
        private LocalDate dateDebutArv;
        private String protocoleInitialArv;
        private String protocoleActuelArv;
        private String arvStadeOmsInitial;
        private String stadeOmsInitial;
        
        // Répondants
        private String repondant1Nom;
        private String repondant1Lien;
        private String repondant1Niveau;
        private String repondant1Profession;
        private String repondant1Tel;
        
        private String repondant2Nom;
        private String repondant2Lien;
        private String repondant2Niveau;
        private String repondant2Profession;
        private String repondant2Tel;
        
        // Tuberculose
        private String tuberculose;
        private String autresAnt;
        
        // Patient
        private String profession;
        private String statutFamilial;
        private String personneContact;
        private String telephoneContact;
        
        // Soutien
        private String soutienNom;
        private String soutienPrenoms;
        private String soutienLien;
        private String soutienTelephone;
        private String soutienAdresse;
        
        // OMS
        private String stadeOms;
        
        // TAR
        private LocalDate dateDebutTar;
        private String protocoleInitialTar;
        private Integer nbGrossessesPtme;
        private String contraception;
        private String prep;
        
        // Maladies chroniques
        private String maladiesChroniques;
        private String autresMaladiesChroniques;
        
        // Données imbriquées
        private List<IndexTestDTO> indexTests;
        private List<PriseEnChargeTBDTO> priseEnChargeTbs;
        private List<PTMEDTO> ptmes;
        private List<SuiviImmunovirologiqueDTO> suiviImmunovirologiques;
        private List<SuiviPathologiqueDTO> suiviPathologiques;
        private List<SuiviARVDTO> suiviARVs;
        private List<DepistageFamilialDTO> depistageFamiliales;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IndexTestDTO {
        private Long id;
        private String nom;
        private String type;
        private Integer age;
        private String sexe;
        private String statut;
        private String resultat;
        private String soins;
        private String identifiant;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriseEnChargeTBDTO {
        private Long id;
        private LocalDate date;
        private LocalDate debut;
        private LocalDate fin;
        private String issu;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PTMEDTO {
        private Long id;
        private LocalDate dateDiagnostic;
        private String rangCpn;
        private LocalDate dateProbableAcc;
        private String issue;
        private LocalDate dateReelle;
        private String modeAcc;
        private String allaitement;
        private String prophylaxie;
        private String protocole;
        private LocalDate dateDebutProtocole;
        private String pcr1;
        private LocalDate datePrelPcr;
        private String resultatPcr;
        private String serologie;
        private LocalDate datePrelSero;
        private String resultatSero;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuiviImmunovirologiqueDTO {
        private Long id;
        private String date;
        private String cd4;
        private String chargeVirale;
        private String cd4Pourcentage;
        private String stadeOms;
        private String observations;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuiviPathologiqueDTO {
        private Long id;
        private String date;
        private String taille;
        private String poids;
        private String imc;
        private String ta;
        private String temperature;
        private String pouls;
        private String rechercheTB;
        private String resultatTB;
        private String tpt;
        private String autresPathologies;
        private String cotrimoxazole;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuiviARVDTO {
        private Long id;
        private LocalDate dateVisite;
        private String situationArv;
        private String changementLignePreciser;
        private String protocole;
        private String substitutionMotif;
        private String substitutionPrecision;
        private String stadeCliniqueOms;
        private Boolean observanceCorrecte;
        private String evaluationNutritionnelle;
        private String classification;
        private String modeleSoinsNumero;
        private LocalDate prochainRdv;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepistageFamilialDTO {
        private Long id;
        private String nom;
        private String type;
        private Integer age;
        private String sexe;
        private String statut;
        private String resultat;
        private String soins;
        private String identifiant;
    }
}
