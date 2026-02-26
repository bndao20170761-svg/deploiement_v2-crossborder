package sn.uasz.Patient_PVVIH.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private Boolean active;
    private LocalDateTime dateCreation;
    private LocalDateTime dateDernierAcces;
    private String nationalite;
    private String nom;
    private String password;
    private String prenom;
    private String profil;


}
