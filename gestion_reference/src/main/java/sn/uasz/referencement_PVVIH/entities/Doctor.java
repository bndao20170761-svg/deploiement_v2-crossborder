package sn.uasz.referencement_PVVIH.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @Column(name = "code_doctor", nullable = false)
    private String codeDoctor;

    @Column(nullable = true)
    private String email;

    @Column(nullable = true)  // ✅ Rendu nullable car synchronisé depuis gestion_user
    private String fonction;

    @Column(name = "lieu_exercice", nullable = true)
    private String lieuExercice;

    @Column(nullable = true)
    private String pseudo;

    @Column(nullable = true)
    private String telephone;

    @ManyToOne
    @JoinColumn(name = "id_hopital")
    private Hopital hopital;

    @ManyToOne
    @JoinColumn(name = "utilisateur")
    private User utilisateur;
}
