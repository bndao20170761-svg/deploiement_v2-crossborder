package sn.uasz.User_API_PVVIH.entities;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prestataire")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prestataire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Enumerated(EnumType.STRING)
    private TypePrestataire type; // MEDECIN_PEC, ASSISTANT_SOCIAL, PEDIATRE

    private String specialite;
    private String telephone;
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hopital_id")
    @JsonBackReference
    private Hopital hopital;

    public enum TypePrestataire {
        MEDECIN_PEC,
        ASSISTANT_SOCIAL, 
        PEDIATRE
    }
}