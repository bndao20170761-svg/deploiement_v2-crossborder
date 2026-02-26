package com.enda.crossborder.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "prise_en_charge_tb")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriseEnChargeTB {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "date")
    private LocalDate date;
    
    @Column(name = "debut")
    private LocalDate debut;
    
    @Column(name = "fin")
    private LocalDate fin;
    
    @Column(name = "issu")
    private String issu;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_patient_id")
    private DossierPatient dossierPatient;
}
