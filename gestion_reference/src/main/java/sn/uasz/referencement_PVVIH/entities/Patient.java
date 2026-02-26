package sn.uasz.referencement_PVVIH.entities;

import jakarta.persistence.*;
import lombok.*;
import sn.uasz.referencement_PVVIH.entities.Doctor;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "patient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @Column(name = "code_patient", nullable = false)
    private String codePatient;

    private String adressePermanent;
    private String adresseTemporaire;
    private Long age;
    private Date dateNaissance;
    private String profession;
    private String pseudo;
    private String sexe;
    private String statutMatrimoniale;
    private String telephone;

    @ManyToOne
    @JoinColumn(name = "doctor_create", referencedColumnName = "code_doctor") // <-- spécifie bien referencedColumnName
    private Doctor doctorCreate;


    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "utilisateur")
    private User utilisateur;
}
