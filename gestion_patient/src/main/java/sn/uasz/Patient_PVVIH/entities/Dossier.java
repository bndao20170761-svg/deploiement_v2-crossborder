package sn.uasz.Patient_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "dossier")
public class Dossier {

    @Id
    @Column(name = "code_dossier", nullable = false, updatable = false)
    private String codeDossier;

    @Column(name = "codification", nullable = true, updatable = false)
    private String codificationNationale;

    @Column(name = "notification", nullable = true, updatable = false)
    private String numeroNotification;

    // ✅ CHANGEMENT: identificationBiom devient le template d'iris (encodé en Base64)
    @Lob
    @Column(name = "identification_biom", columnDefinition = "LONGTEXT")
    private String identificationBiom;



    // ✅ Statut de l'enregistrement biométrique
    @Column(name = "biometric_status")
    private String biometricStatus = "PENDING"; // PENDING, CAPTURED, VERIFIED, FAILED

    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Page> pages = new ArrayList<>();

    // ✅ Stocker les codes au lieu des références d'entités
    @Column(name = "patient_code")
    private String patientCode;

    @Column(name = "doctor_create_code")
    private String doctorCreateCode;

    // ✅ Garder les références pour la compatibilité (optionnel)
    @OneToOne(mappedBy = "dossier")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctorCreate;

    @PrePersist
    public void prePersist() {
        if (this.codeDossier == null) {
            this.codeDossier = "DOSS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        // ✅ SUPPRIMER la génération automatique de code-barres
        // Le champ identificationBiom sera rempli avec le template d'iris
    }
}