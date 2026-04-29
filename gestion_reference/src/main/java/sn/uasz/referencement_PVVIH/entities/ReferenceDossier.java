package sn.uasz.referencement_PVVIH.entities;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "reference_dossier")
public class ReferenceDossier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "code_dossier", unique = true, nullable = false)
    private String codeDossier;
    
    @Column(name = "code_reference", unique = true, nullable = false)
    private String codeReference;
    
    @Column(name = "code_patient", nullable = false)
    private String codePatient;
    
    @Column(name = "nom_patient")
    private String nomPatient;
    
    @Column(name = "prenom_patient")
    private String prenomPatient;
    
    @Column(name = "code_hopital")
    private String codeHopital;
    
    @Column(name = "nom_hopital")
    private String nomHopital;
    
    @Column(name = "code_docteur")
    private String codeDocteur;
    
    @Column(name = "nom_docteur")
    private String nomDocteur;
    
    @Column(name = "motif_reference")
    private String motifReference;
    
    @Column(name = "type_reference")
    private String typeReference;
    
    @Column(name = "date_reference")
    private LocalDateTime dateReference;
    
    @Column(name = "date_prise_en_charge")
    private LocalDateTime datePriseEnCharge;
    
    @Column(name = "statut")
    private String statut;
    
    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;
    
    @Column(name = "code_referenceur")
    private String codeReferenceur;
    
    @Column(name = "nom_referenceur")
    private String nomReferenceur;
    
    @Column(name = "telephone_referenceur")
    private String telephoneReferenceur;
    
    @Column(name = "email_referenceur")
    private String emailReferenceur;
    
    @Column(name = "date_creation")
    private LocalDateTime dateCreation;
    
    @Column(name = "date_modification")
    private LocalDateTime dateModification;
    
    // Nouveaux champs pour la gestion de l'état des références
    @Column(name = "active")
    private Boolean active;
    
    @Column(name = "etat")
    private Boolean etat;
    
    @Column(name = "validation")
    private Boolean validation;
    
    // Relations avec les médecins
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id")
    private Doctor medecin;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_auteur_id")
    private Doctor medecinAuteur;
    
    // ===== CHAMPS CLINIQUES DÉTAILLÉS =====
    
    // Motif de référence détaillé
    @Column(name = "changement_adresse")
    private Boolean changementAdresse;
    
    @Column(name = "changement_adresse_temporaire")
    private Boolean changementAdresseTemporaire;
    
    @Column(name = "changement_adresse_permanent")
    private Boolean changementAdressePermanent;
    
    @Column(name = "autres_a_preciser")
    private Boolean autresAPreciser;
    
    @Column(name = "autres_motif")
    private String autresMotif;
    
    @Column(name = "services_enabled")
    private Boolean servicesEnabled;
    
    @Column(name = "service_arv")
    private Boolean serviceArv;
    
    @Column(name = "service_laboratoire")
    private Boolean serviceLaboratoire;
    
    @Column(name = "service_ptme")
    private Boolean servicePtme;
    
    @Column(name = "service_crc")
    private Boolean serviceCrc;
    
    @Column(name = "service_pvvih")
    private Boolean servicePvvih;
    
    // Informations cliniques de base
    @Column(name = "poids_kg")
    private Double poidsKg;
    
    @Column(name = "traitement_arv")
    private Boolean traitementARV;
    
    @Column(name = "traitement_tb")
    private Boolean traitementtb;
    
    @Column(name = "transaminase")
    private String transaminase;
    
    @Column(name = "transaminase_asat")
    private String transaminaseAsat;
    
    @Column(name = "transaminase_alat")
    private String transaminaseAlat;
    
    @Column(name = "cd4_dernier")
    private String cd4Dernier;
    
    @Column(name = "cd4_debut_traitement")
    private String cd4DebutTraitement;
    
    @Column(name = "cd4_inclusion")
    private String cd4Inclusion;
    
    @Column(name = "charge_virale_niveau")
    private String chargeViraleNiveau;
    
    @Column(name = "hb_niveau")
    private String hbNiveau;
    
    @Column(name = "lymphocytes_totaux")
    private String lymphocytesTotaux;
    
    @Column(name = "allergie")
    private String allergie;
    
    @Column(name = "creatinemie")
    private String creatinemie;
    
    @Column(name = "crache_baar")
    private String cracheBaar;
    
    @Column(name = "aghbs")
    private String aghbs;
    
    @Column(name = "autre_analyse")
    private Boolean autreAnalyse;
    
    @Column(name = "autre_traitement")
    private Boolean autreTraitement;
    
    @Column(name = "resultat_trans")
    private String resultatTrans;
    
    // Dates cliniques
    @Column(name = "date_transaminase")
    private LocalDate dateTransaminase;
    
    @Column(name = "date_cd4_dernier")
    private LocalDate dateCd4Dernier;
    
    @Column(name = "date_cd4_debut_traitement")
    private LocalDate dateCd4DebutTraitement;
    
    @Column(name = "date_cd4_inclusion")
    private LocalDate dateCd4Inclusion;
    
    @Column(name = "date_debut_charge_virale")
    private LocalDate dateDebutChargeVirale;
    
    @Column(name = "date_hb")
    private LocalDate dateHb;
    
    @Column(name = "date_lymphocytes")
    private LocalDate dateLymphocytes;
    
    @Column(name = "date_allergie")
    private LocalDate dateAllergie;
    
    @Column(name = "date_creatinemie")
    private LocalDate dateCreatinemie;
    
    @Column(name = "date_crache_baar")
    private LocalDate dateCracheBaar;
    
    @Column(name = "date_aghbs")
    private LocalDate dateAghbs;
    
    @Column(name = "date_autre_analyse")
    private LocalDate dateAutreAnalyse;
    
    @Column(name = "date_debut_arv")
    private LocalDate dateDebutARV;
    
    // Relations pour les motifs
    @OneToMany(mappedBy = "referenceDossier", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Motif> motifs;
    
    // Relations pour les listes imbriquées
    @OneToMany(mappedBy = "referenceDossier", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Protocole1> protocoles1s;
    
    @OneToMany(mappedBy = "referenceDossier", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Protocole2> protocoles2s;
    
    @OneToMany(mappedBy = "referenceDossier", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProtocoleTherap> protocolesTheraps;
    
    @OneToMany(mappedBy = "referenceDossier", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProfilVIH> profils;
    
    @OneToMany(mappedBy = "referenceDossier", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<StadeOMS> stades;
}
