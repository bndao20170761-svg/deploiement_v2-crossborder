package sn.uasz.Patient_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "pages")
public class Page {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================
    // Parents
    // ==========================
    @Column(length = 100)
    private String pereNomPrenoms;

    @Column(length = 20)
    private String pereStatut;

    @Column(length = 50)
    private String pereNiveauInstruction;

    @Column(length = 50)
    private String pereProfession;

    @Column(length = 20)
    private String pereStatutVih;

    @Column(length = 20)
    private String pereTelephone;

    @Column(length = 100)
    private String mereNomPrenoms;

    @Column(length = 20)
    private String mereStatut;

    @Column(length = 50)
    private String mereNiveauInstruction;

    @Column(length = 50)
    private String mereProfession;

    @Column(length = 20)
    private String mereStatutVih;

    @Column(length = 20)
    private String mereTelephone;

    // ==========================
    // Naissance & Référence
    // ==========================
    @Column(length = 100)
    private String naissanceStructure;

    private Double poidsNaissance;

    private Integer tailleNaissance;

    private Integer perimetreCranien;

    @Column(length = 20)
    private String apgar;

    @ElementCollection
    @CollectionTable(name = "page_portes_entree", joinColumns = @JoinColumn(name = "page_id"))
    @Column(name = "porte_entree", length = 50)
    private List<String> portesEntree;

    @Column(length = 20)
    private String reference;

    private LocalDate dateReference;

    @Column(length = 100)
    private String siteOrigine;

    // ==========================
    // Test VIH & ETP
    // ==========================
    private LocalDate dateTest;

    private LocalDate dateConfirmation;

    @Column(length = 100)
    private String lieuTest;

    @Column(length = 20)
    private String resultat;

    private LocalDate dateDebutETP;

    private Integer ageETP;

    @Column(length = 20)
    private String annonceComplete;

    private Integer ageAnnonce;

    // ==========================
    // Statut vaccinal
    // ==========================
    @ElementCollection
    @CollectionTable(name = "page_vaccins", joinColumns = @JoinColumn(name = "page_id"))
    @Column(name = "vaccin", length = 50)
    private List<String> vaccins;

    @Lob
    private String autresVaccins;

    // ==========================
    // Enfant exposé
    // ==========================
    @Column(length = 50)
    private String enfantProphylaxieArvNaissance;

    @Column(length = 50)
    private String enfantProphylaxieCotrimoxazole;

    @ElementCollection
    @CollectionTable(name = "page_enfant_alimentation", joinColumns = @JoinColumn(name = "page_id"))
    @Column(name = "alimentation", length = 50)
    private List<String> enfantAlimentation;

    private Integer enfantSevrageAgeMois;

    @Column(length = 50)
    private String enfantNumeroSeropositif;

    // ==========================
    // Infos mère
    // ==========================
    @Column(length = 50)
    private String mereTritherapieGrossesse;

    @Column(name = "date_debut_arv")
    private String dateDebutArv;

    @Column(name = "date_debutarv")
    private String dateDebutArv2;

    @Column(length = 50)
    private String protocoleInitialArv;

    // ==========================
    // Répondants légaux
    // ==========================
    @Column(length = 100)
    private String repondant1Nom;

    @Column(length = 50)
    private String repondant1Lien;

    @Column(length = 50)
    private String repondant1Niveau;

    @Column(length = 50)
    private String repondant1Profession;

    @Column(length = 20)
    private String repondant1Tel;

    @Column(length = 100)
    private String repondant2Nom;

    @Column(length = 50)
    private String repondant2Lien;

    @Column(length = 50)
    private String repondant2Niveau;

    @Column(length = 50)
    private String repondant2Profession;

    @Column(length = 20)
    private String repondant2Tel;

    // ==========================
    // Antécédents & OMS
    // ==========================
    @Column(length = 50)
    private String arvStadeOmsInitial;

    @Column(length = 50)
    private String protocole;

    @ElementCollection
    @CollectionTable(name = "page_stade_oms", joinColumns = @JoinColumn(name = "page_id"))
    @Column(name = "stade", length = 50)
    private List<String> stadeOmsInitial;

    @Column(length = 50)
    private String tuberculose;

    @Lob
    private String autresAnt;

    // ==========================
    // Déjà ajoutés
    // ==========================
    @Column(length = 50)
    private String profession;

    @Column(length = 50)
    private String statutFamilial;

    @Column(length = 100)
    private String personneContact;

    @Column(length = 20)
    private String telephoneContact;

    @Column(length = 100)
    private String soutienNom;

    @Column(length = 100)
    private String soutienPrenoms;

    @Column(length = 50)
    private String soutienLien;

    @Column(length = 20)
    private String soutienTelephone;

    @Lob
    private String soutienAdresse;

    @Column(length = 50)
    private String arv;

  

    @Column(length = 50)
    private String protocoleActuelArv;

    private Integer nbGrossessesPtme;

    @Column(length = 50)
    private String contraception;

    @Column(length = 50)
    private String prep;

    @Lob
    private String maladiesChroniques;

    @Lob
    private String autresMaladiesChroniques;

    @Column(length = 50)
    private String stadeOms;

    private LocalDate dateDebutTar;

    @Column(length = 50)
    private String protocoleInitialTar;

    // ==========================
    // Relations
    // ==========================
    @ManyToOne
    @JoinColumn(name = "dossier_id", referencedColumnName = "code_dossier")
    @JsonBackReference
    private Dossier dossier;




    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Bilan> bilans;


    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true)

    @JsonManagedReference
    private List<IndexTest> indexTests;

    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PriseEnChargeTb> priseEnChargeTbs;

    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PTME> ptmes;

    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Suivi_Immunovirologique> suiviImmunovirologiques;

    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<SuiviPathologique> suiviPathologiques;

    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<SuiviARV> suiviARVs;

    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<DepistageFamiliale> depistageFamiliales;

}
