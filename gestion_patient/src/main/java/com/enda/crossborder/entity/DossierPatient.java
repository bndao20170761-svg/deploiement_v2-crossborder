package com.enda.crossborder.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dossier_patient")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierPatient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "code_dossier", unique = true, nullable = false)
    private String codeDossier;
    
    @Column(name = "code_patient", nullable = false)
    private String codePatient;
    
    @Column(name = "nom_complet")
    private String nomComplet;
    
    @Column(name = "doctor_create_nom")
    private String doctorCreateNom;
    
    @Column(name = "identification_biom")
    private String identificationBiom;
    
    @Column(name = "patient_id")
    private Long patientId;
    
    @Column(name = "doctor_id")
    private Long doctorId;
    
    // Informations familiales
    @Column(name = "pere_nom_prenoms")
    private String pereNomPrenoms;
    
    @Column(name = "pere_statut")
    private String pereStatut;
    
    @Column(name = "pere_niveau_instruction")
    private String pereNiveauInstruction;
    
    @Column(name = "pere_profession")
    private String pereProfession;
    
    @Column(name = "pere_statut_vih")
    private String pereStatutVih;
    
    @Column(name = "pere_telephone")
    private String pereTelephone;
    
    @Column(name = "mere_nom_prenoms")
    private String mereNomPrenoms;
    
    @Column(name = "mere_statut")
    private String mereStatut;
    
    @Column(name = "mere_niveau_instruction")
    private String mereNiveauInstruction;
    
    @Column(name = "mere_profession")
    private String mereProfession;
    
    @Column(name = "mere_statut_vih")
    private String mereStatutVih;
    
    @Column(name = "mere_telephone")
    private String mereTelephone;
    
    // Naissance
    @Column(name = "naissance_structure")
    private String naissanceStructure;
    
    @Column(name = "poids_naissance")
    private Double poidsNaissance;
    
    @Column(name = "taille_naissance")
    private Double tailleNaissance;
    
    @Column(name = "perimetre_cranien")
    private Double perimetreCranien;
    
    @Column(name = "apgar")
    private String apgar;
    
    // Référence
    @Column(name = "portes_entree")
    private String portesEntree;
    
    @Column(name = "reference")
    private String reference;
    
    @Column(name = "date_reference")
    private LocalDate dateReference;
    
    @Column(name = "site_origine")
    private String siteOrigine;
    
    // Test VIH
    @Column(name = "date_test")
    private LocalDate dateTest;
    
    @Column(name = "date_confirmation")
    private LocalDate dateConfirmation;
    
    @Column(name = "lieu_test")
    private String lieuTest;
    
    @Column(name = "resultat")
    private String resultat;
    
    // ETP (Éducation Thérapeutique)
    @Column(name = "date_debut_etp")
    private LocalDate dateDebutETP;
    
    @Column(name = "age_etp")
    private Integer ageETP;
    
    @Column(name = "annonce_complete")
    private String annonceComplete;
    
    @Column(name = "age_annonce")
    private Integer ageAnnonce;
    
    // Vaccination
    @Column(name = "vaccins")
    private String vaccins;
    
    @Column(name = "autres_vaccins")
    private String autresVaccins;
    
    // Prophylaxie enfant
    @Column(name = "enfant_prophylaxie_arv_naissance")
    private String enfantProphylaxieArvNaissance;
    
    @Column(name = "enfant_prophylaxie_cotrimoxazole")
    private String enfantProphylaxieCotrimoxazole;
    
    @Column(name = "enfant_alimentation")
    private String enfantAlimentation;
    
    @Column(name = "enfant_sevrage_age_mois")
    private Integer enfantSevrageAgeMois;
    
    @Column(name = "enfant_numero_seropositif")
    private String enfantNumeroSeropositif;
    
    // Mère - PTME
    @Column(name = "mere_tritherapie_grossesse")
    private String mereTritherapieGrossesse;
    
    // ARV
    @Column(name = "date_debut_arv")
    private LocalDate dateDebutArv;
    
    @Column(name = "protocole_initial_arv")
    private String protocoleInitialArv;
    
    @Column(name = "protocole_actuel_arv")
    private String protocoleActuelArv;
    
    @Column(name = "arv_stade_oms_initial")
    private String arvStadeOmsInitial;
    
    @Column(name = "stade_oms_initial")
    private String stadeOmsInitial;
    
    // Répondants
    @Column(name = "repondant1_nom")
    private String repondant1Nom;
    
    @Column(name = "repondant1_lien")
    private String repondant1Lien;
    
    @Column(name = "repondant1_niveau")
    private String repondant1Niveau;
    
    @Column(name = "repondant1_profession")
    private String repondant1Profession;
    
    @Column(name = "repondant1_tel")
    private String repondant1Tel;
    
    @Column(name = "repondant2_nom")
    private String repondant2Nom;
    
    @Column(name = "repondant2_lien")
    private String repondant2Lien;
    
    @Column(name = "repondant2_niveau")
    private String repondant2Niveau;
    
    @Column(name = "repondant2_profession")
    private String repondant2Profession;
    
    @Column(name = "repondant2_tel")
    private String repondant2Tel;
    
    // Tuberculose
    @Column(name = "tuberculose")
    private String tuberculose;
    
    @Column(name = "autres_ant")
    private String autresAnt;
    
    // Patient
    @Column(name = "profession")
    private String profession;
    
    @Column(name = "statut_familial")
    private String statutFamilial;
    
    @Column(name = "personne_contact")
    private String personneContact;
    
    @Column(name = "telephone_contact")
    private String telephoneContact;
    
    // Soutien
    @Column(name = "soutien_nom")
    private String soutienNom;
    
    @Column(name = "soutien_prenoms")
    private String soutienPrenoms;
    
    @Column(name = "soutien_lien")
    private String soutienLien;
    
    @Column(name = "soutien_telephone")
    private String soutienTelephone;
    
    @Column(name = "soutien_adresse")
    private String soutienAdresse;
    
    // OMS
    @Column(name = "stade_oms")
    private String stadeOms;
    
    // TAR
    @Column(name = "date_debut_tar")
    private LocalDate dateDebutTar;
    
    @Column(name = "protocole_initial_tar")
    private String protocoleInitialTar;
    
    @Column(name = "nb_grossesses_ptme")
    private Integer nbGrossessesPtme;
    
    @Column(name = "contraception")
    private String contraception;
    
    @Column(name = "prep")
    private String prep;
    
    // Maladies chroniques
    @Column(name = "maladies_chroniques")
    private String maladiesChroniques;
    
    @Column(name = "autres_maladies_chroniques")
    private String autresMaladiesChroniques;
    
    // Timestamps
    @Column(name = "created_at")
    private LocalDate createdAt;
    
    @Column(name = "updated_at")
    private LocalDate updatedAt;
    
    // Relations OneToMany
    @OneToMany(mappedBy = "dossierPatient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<IndexTest> indexTests = new ArrayList<>();
    
    @OneToMany(mappedBy = "dossierPatient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PriseEnChargeTB> priseEnChargeTBs = new ArrayList<>();
    
    @OneToMany(mappedBy = "dossierPatient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PTME> ptmes = new ArrayList<>();
    
    @OneToMany(mappedBy = "dossierPatient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SuiviImmunovirologique> suiviImmunovirologiques = new ArrayList<>();
    
    @OneToMany(mappedBy = "dossierPatient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SuiviPathologique> suiviPathologiques = new ArrayList<>();
    
    @OneToMany(mappedBy = "dossierPatient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SuiviARV> suiviARVs = new ArrayList<>();
    
    @OneToMany(mappedBy = "dossierPatient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DepistageFamilial> depistageFamiliales = new ArrayList<>();
}
