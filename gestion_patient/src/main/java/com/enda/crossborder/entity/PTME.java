package com.enda.crossborder.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "ptme")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PTME {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "date_diagnostic")
    private LocalDate dateDiagnostic;
    
    @Column(name = "rang_cpn")
    private String rangCpn;
    
    @Column(name = "date_probable_acc")
    private LocalDate dateProbableAcc;
    
    @Column(name = "issue")
    private String issue;
    
    @Column(name = "date_reelle")
    private LocalDate dateReelle;
    
    @Column(name = "mode_acc")
    private String modeAcc;
    
    @Column(name = "allaitement")
    private String allaitement;
    
    @Column(name = "prophylaxie")
    private String prophylaxie;
    
    @Column(name = "protocole")
    private String protocole;
    
    @Column(name = "date_debut_protocole")
    private LocalDate dateDebutProtocole;
    
    @Column(name = "pcr1")
    private String pcr1;
    
    @Column(name = "date_prel_pcr")
    private LocalDate datePrelPcr;
    
    @Column(name = "resultat_pcr")
    private String resultatPcr;
    
    @Column(name = "serologie")
    private String serologie;
    
    @Column(name = "date_prel_sero")
    private LocalDate datePrelSero;
    
    @Column(name = "resultat_sero")
    private String resultatSero;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_patient_id")
    private DossierPatient dossierPatient;
}
