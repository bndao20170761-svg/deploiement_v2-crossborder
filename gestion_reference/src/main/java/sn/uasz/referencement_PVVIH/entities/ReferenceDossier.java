package sn.uasz.referencement_PVVIH.entities;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "reference_dossier")
public class ReferenceDossier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "code_reference", unique = true, nullable = false)
    private String codeReference;
    
    @Column(name = "code_dossier", nullable = false)
    private String codeDossier;
    
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
    
    // Hôpital d'origine (référenceur)
    @Column(name = "code_hopital_referenceur")
    private String codeHopitalReferenceur;

    @Column(name = "nom_hopital_referenceur")
    private String nomHopitalReferenceur;
    
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
}
