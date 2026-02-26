package com.enda.crossborder.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "index_test")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IndexTest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "nom")
    private String nom;
    
    @Column(name = "type")
    private String type;
    
    @Column(name = "age")
    private Integer age;
    
    @Column(name = "sexe")
    private String sexe;
    
    @Column(name = "statut")
    private String statut;
    
    @Column(name = "resultat")
    private String resultat;
    
    @Column(name = "soins")
    private String soins;
    
    @Column(name = "identifiant")
    private String identifiant;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_patient_id")
    private DossierPatient dossierPatient;
}
