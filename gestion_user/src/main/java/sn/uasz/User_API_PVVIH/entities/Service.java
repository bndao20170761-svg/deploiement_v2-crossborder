package sn.uasz.User_API_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
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

    // 🔹 AJOUTEZ CES CHAMPS POUR LES PRESTATAIRES
    private String nomPrestataire;
    private String typePrestataire; // 'medecin-pec', 'assistant-social', 'pediatre'
    private String specialitePrestataire;
    private String contactPrestataire;
}