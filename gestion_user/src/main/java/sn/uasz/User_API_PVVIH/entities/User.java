package sn.uasz.User_API_PVVIH.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "username", name = "uk_username")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;
    private Boolean active;
    private LocalDateTime dateCreation;
    private LocalDateTime dateDernierAcces;
    private String nationalite;//
    private String nom;
    private String password;
    private String prenom;
    private String profil;
    private String sexe;
    private String statutMatrimoniale;

}
