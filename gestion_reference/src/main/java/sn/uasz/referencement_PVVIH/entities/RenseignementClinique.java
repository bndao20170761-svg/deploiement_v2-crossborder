package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")

@Entity
@Table(name = "renseignement_clinique")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RenseignementClinique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String aghbs;
    private String allergie;
    private Boolean autreAnalyse;
    private Boolean autreTraitement;

    private String cd4DebutTraitement;
    private String cd4Dernier;
    private String cd4Inclusion;

    private String chargeViraleNiveau;
    private String cracheBaar;
    private String creatinemie;

    private Date date;
    private Date dateAutreAnalyse;
    private Date dateCd4DebutTraitement;
    private Date dateCd4Dernier;
    private Date dateCd4Inclusion;
    private Date dateDebutChargeVirale;
    private Date dateCracheBaar;
    private Date dateCreatinemie;
    private Date dateHb;
    private Date dateDebutARV;

    private String hbNiveau;
    private String poidsKg;
    private String resultatTrans;
    private Boolean traitementARV;
    private Boolean traitementtb;
    private String transaminase;
    private LocalDateTime dateTransaminase;

    private String transaminaseAlat;
    private String transaminaseAsat;
    private LocalDateTime dateAghbs;

    @ManyToOne
    @JoinColumn(name = "reference_id")
    @JsonBackReference
    private Reference reference;


    @OneToMany(mappedBy = "renseignementClinique", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Protocole1> protocoles1s;

    @OneToMany(mappedBy = "renseignementClinique", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Protocole2> protocoles2s;

    @OneToMany(mappedBy = "renseignementClinique", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ProtocoleTherap> protocolesTheraps;

    @OneToMany(mappedBy = "renseignementClinique", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RenseignementProfil> profils;

    @OneToMany(mappedBy = "renseignementClinique", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RenseignementStade> stades;

}
