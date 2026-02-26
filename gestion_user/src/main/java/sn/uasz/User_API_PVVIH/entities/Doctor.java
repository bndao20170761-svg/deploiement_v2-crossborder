package sn.uasz.User_API_PVVIH.entities;

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

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String fonction;

    @Column(name = "lieu_exercice", nullable = false)
    private String lieuExercice;

    @Column(nullable = false)
    private String pseudo;

    @Column(nullable = false)
    private String telephone;
    @Column(nullable = false)
    private String password;

    @ManyToOne
    @JoinColumn(name = "id_hopital")
    private Hopital hopital;

    @ManyToOne
    @JoinColumn(name = "utilisateur")
    private User utilisateur;
}
