package sn.uasz.User_API_PVVIH.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "membre")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Membre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    @Column(nullable = false)
    private String pseudo;

    @ManyToOne
    @JoinColumn(name = "id_association")
    private Association association;

    @ManyToOne
    @JoinColumn(name = "utilisateur")
    private User utilisateur;
}