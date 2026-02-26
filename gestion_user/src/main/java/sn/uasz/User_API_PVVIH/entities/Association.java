package sn.uasz.User_API_PVVIH.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "association")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Association {

    @Id
    @Column(name = "code_association", nullable = false, unique = true)
    private String codeAssociation;

    private String email;

    @Column(nullable = false)
    private String pays;

    @Column(nullable = false)
    private String pseudo;

    private String quartier;

    private String telephone;

    @Column(nullable = false)
    private String ville;

    @ManyToOne
    @JoinColumn(name = "utilisateur")
    private User utilisateur;
}