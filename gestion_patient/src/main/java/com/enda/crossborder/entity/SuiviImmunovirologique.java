package com.enda.crossborder.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "suivi_immunovirologique")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuiviImmunovirologique {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "date")
    private String date;
    
    @Column(name = "cd4")
    private String cd4;
    
    @Column(name = "charge_virale")
    private String chargeVirale;
    
    @Column(name = "cd4_pourcentage")
    private String cd4Pourcentage;
    
    @Column(name = "stade_oms")
    private String stadeOms;
    
    @Column(name = "observations")
    private String observations;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_patient_id")
    private DossierPatient dossierPatient;
}
