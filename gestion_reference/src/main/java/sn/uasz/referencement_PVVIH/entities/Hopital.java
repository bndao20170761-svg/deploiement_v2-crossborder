package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import sn.uasz.referencement_PVVIH.entities.Doctor;

import java.util.ArrayList;
import java.util.List;

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

    // NOUVEAUX CHAMPS POUR LA CARTOGRAPHIE
    private Double latitude;
    private Double longitude;
    private String adresseComplete;
    private String telephoneFixe;

    // Relation avec les médecins (si elle n'existe pas déjà)
    @OneToMany(mappedBy = "hopital", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Doctor> doctors = new ArrayList<>();

    @OneToMany(mappedBy = "hopital", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Service> services = new ArrayList<>();
}