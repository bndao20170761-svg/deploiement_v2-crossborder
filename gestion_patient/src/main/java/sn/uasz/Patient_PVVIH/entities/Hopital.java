package sn.uasz.Patient_PVVIH.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hopital")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hopital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean active;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String pays;

    @Column(nullable = false)
    private String ville;
}
