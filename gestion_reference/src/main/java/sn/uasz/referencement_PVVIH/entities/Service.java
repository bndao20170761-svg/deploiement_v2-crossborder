package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import sn.uasz.referencement_PVVIH.entities.Hopital;

@Entity
@Table(name = "service_hopital")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String type;

    @ManyToOne
    @JoinColumn(name = "hopital_id", referencedColumnName = "id")
    @JsonBackReference
    private Hopital hopital;

    private String prestataire; // ← Ajouter ce champ
    private String contact;
}
