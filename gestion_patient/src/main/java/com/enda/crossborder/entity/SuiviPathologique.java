package com.enda.crossborder.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "suivi_pathologique")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuiviPathologique {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "date")
    private String date;
    
    @Column(name = "taille")
    private String taille;
    
    @Column(name = "poids")
    private String poids;
    
    @Column(name = "imc")
    private String imc;
    
    @Column(name = "ta")
    private String ta;
    
    @Column(name = "temperature")
    private String temperature;
    
    @Column(name = "pouls")
    private String pouls;
    
    @Column(name = "recherche_tb")
    private String rechercheTB;
    
    @Column(name = "resultat_tb")
    private String resultatTB;
    
    @Column(name = "tpt")
    private String tpt;
    
    @Column(name = "autres_pathologies")
    private String autresPathologies;
    
    @Column(name = "cotrimoxazole")
    private String cotrimoxazole;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_patient_id")
    private DossierPatient dossierPatient;
}
