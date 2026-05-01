package sn.uasz.referencement_PVVIH.dtos;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReferenceDossierDto {
    private Long id;
    private String codeDossier;
    private String codeReference;
    private String codePatient;
    private String nomPatient;
    private String prenomPatient;
    // Champs enrichis pour affichage (non persistés)
    private String dateNaissance;
    private Long age;
    private String sexe;
    private String profession;
    private String telephone;
    private String nationalite;
    private String statutMatrimoniale;
    private String codeHopital;
    private String nomHopital;
    private String codeHopitalReferenceur;
    private String nomHopitalReferenceur;
    private String fonctionReferenceur;
    private String nationaliteReferenceur;
    private String codeDocteur;
    private String nomDocteur;
    private String motifReference;
    private String typeReference;
    private LocalDateTime dateReference;
    private LocalDateTime datePriseEnCharge;
    private String statut;
    private String observations;
    private String codeReferenceur;
    private String nomReferenceur;
    private String telephoneReferenceur;
    private String emailReferenceur;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private Boolean active;
    private Boolean etat;
    private Boolean validation;
    
    // ===== CHAMPS CLINIQUES DÉTAILLÉS =====
    
    // Motif de référence détaillé
    private Boolean changementAdresse;
    private Boolean changementAdresseTemporaire;
    private Boolean changementAdressePermanent;
    private Boolean autresAPreciser;
    private String autresMotif;
    private Boolean servicesEnabled;
    private Boolean serviceArv;
    private Boolean serviceLaboratoire;
    private Boolean servicePtme;
    private Boolean serviceCrc;
    private Boolean servicePvvih;
    
    // Informations cliniques de base
    private Double poidsKg;
    private Boolean traitementARV;
    private Boolean traitementtb;
    private String transaminase;
    private String transaminaseAsat;
    private String transaminaseAlat;
    private String cd4Dernier;
    private String cd4DebutTraitement;
    private String cd4Inclusion;
    private String chargeViraleNiveau;
    private String hbNiveau;
    private String lymphocytesTotaux;
    private String allergie;
    private String creatinemie;
    private String cracheBaar;
    private String aghbs;
    private Boolean autreAnalyse;
    private Boolean autreTraitement;
    private String resultatTrans;
    
    // Dates cliniques
    private LocalDate dateTransaminase;
    private LocalDate dateCd4Dernier;
    private LocalDate dateCd4DebutTraitement;
    private LocalDate dateCd4Inclusion;
    private LocalDate dateDebutChargeVirale;
    private LocalDate dateHb;
    private LocalDate dateLymphocytes;
    private LocalDate dateAllergie;
    private LocalDate dateCreatinemie;
    private LocalDate dateCracheBaar;
    private LocalDate dateAghbs;
    private LocalDate dateAutreAnalyse;
    private LocalDate dateDebutARV;
    
    // Relations pour les motifs
    private List<MotifDto> motifs;
    
    // Listes imbriquées
    private List<Protocole1Dto> protocoles1s;
    private List<Protocole2Dto> protocoles2s;
    private List<ProtocoleTherapDto> protocolesTheraps;
    private List<ProfilVIHDto> profils;
    private List<StadeOMSDto> stades;
}
