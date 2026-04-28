package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/*
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")

@Entity
@Table(name = "reference")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder*/
public class Reference {
/*
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean active;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime date;

    private String site;
    private String statut;
    private String type;
    private Boolean etat;
    private String observations;
    private String motifReference;
    private String motifReferenceAutre;
    private String typeReference;

    @ManyToOne
    @JoinColumn(name = "assistant", referencedColumnName = "code_assistant")
    @JsonIgnoreProperties({"references", "hopital", "user"})
    private AssistantSocial assistantSocial;

    @ManyToOne
    @JoinColumn(name = "expediteur", referencedColumnName = "code_doctor")
    @JsonIgnoreProperties({"references", "hopital", "user"})
    private Doctor medecinAuteur;

    @ManyToOne
    @JoinColumn(name = "destinataire", referencedColumnName = "code_doctor")
    @JsonIgnoreProperties({"references", "hopital", "user"})
    private Doctor medecin;

    @ManyToOne
    @JoinColumn(name = "patient", referencedColumnName = "code_patient")
    @JsonIgnoreProperties({"references", "doctorCreate", "user"})
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "hopital", referencedColumnName = "id")
    @JsonIgnoreProperties({"references", "user"})
    private Hopital hopital;

    @Builder.Default
    @OneToMany(mappedBy = "reference", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RenseignementClinique> renseignementsCliniques = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "reference", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Motif> motifs = new ArrayList<>();

} 

/*
@Entity
@Table(name = "reference")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reference { */
}