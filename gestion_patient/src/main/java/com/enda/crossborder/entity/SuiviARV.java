package com.enda.crossborder.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "suivi_arv")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuiviARV {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "date_visite")
    private LocalDate dateVisite;
    
    @Column(name = "situation_arv")
    private String situationArv;
    
    @Column(name = "changement_ligne_preciser")
    private String changementLignePreciser;
    
    @Column(name = "protocole")
    private String protocole;
    
    @Column(name = "substitution_motif")
    private String substitutionMotif;
    
    @Column(name = "substitution_precision")
    private String substitutionPrecision;
    
    @Column(name = "stade_clinique_oms")
    private String stadeCliniqueOms;
    
    @Column(name = "observance_correcte")
    private Boolean observanceCorrecte;
    
    @Column(name = "evaluation_nutritionnelle")
    private String evaluationNutritionnelle;
    
    @Column(name = "classification")
    private String classification;
    
    @Column(name = "modele_soins_numero")
    private String modeleSoinsNumero;
    
    @Column(name = "prochain_rdv")
    private LocalDate prochainRdv;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_patient_id")
    private DossierPatient dossierPatient;
}
