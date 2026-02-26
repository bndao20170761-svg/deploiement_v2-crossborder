package sn.uasz.User_API_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
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
    private String type;

    // Relation avec les médecins
    @OneToMany(mappedBy = "hopital", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Doctor> doctors = new ArrayList<>();

    // NOUVEAU : Docteur qui a créé l'hôpital
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_doctor_id")
    private Doctor createdByDoctor;

    // NOUVEAU : Date de création
    @CreationTimestamp
    private LocalDateTime createdAt;

    // 🔹 SUPPRIMEZ le champ prestatairesJson
    // @Column(columnDefinition = "TEXT")
    // private String prestatairesJson; // ← SUPPRIMEZ cette ligne

    // Relation avec les services
    @OneToMany(mappedBy = "hopital", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Service> services = new ArrayList<>();

    // 🔹 Relation OneToMany avec les prestataires
    @OneToMany(mappedBy = "hopital", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Prestataire> prestataires = new ArrayList<>();

    // Méthode utilitaire pour ajouter un service
    public void addService(Service service) {
        if (this.services == null) {
            this.services = new ArrayList<>();
        }
        service.setHopital(this);
        this.services.add(service);
    }

    // 🔹 Méthode utilitaire pour ajouter un prestataire
    public void addPrestataire(Prestataire prestataire) {
        if (this.prestataires == null) {
            this.prestataires = new ArrayList<>();
        }
        if (!this.prestataires.contains(prestataire)) {
            this.prestataires.add(prestataire);
            prestataire.setHopital(this);
        }
    }
    
    // 🔹 Méthode utilitaire pour supprimer un prestataire
    public void removePrestataire(Prestataire prestataire) {
        if (this.prestataires != null) {
            this.prestataires.remove(prestataire);
            prestataire.setHopital(null);
        }
    }
}