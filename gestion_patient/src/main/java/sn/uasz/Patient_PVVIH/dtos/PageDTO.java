package sn.uasz.Patient_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageDTO {
    private Long id;

    // Section IX : Père
    private String pereNomPrenoms;
    private String pereStatut;
    private String pereNiveauInstruction;
    private String pereProfession;
    private String pereStatutVih;
    private String pereTelephone;

    // Section IX : Mère
    private String mereNomPrenoms;
    private String mereStatut;
    private String mereNiveauInstruction;
    private String mereProfession;
    private String mereStatutVih;
    private String mereTelephone;

    // Naissance
    private String naissanceStructure;
    private Double poidsNaissance;
    private Integer tailleNaissance;
    private Integer perimetreCranien;
    private String apgar;

    // Entrée / Référence
    private List<String> portesEntree;
    private String reference;
    private LocalDate dateReference;
    private String siteOrigine;

    // Dépistage
    private LocalDate dateTest;
    private LocalDate dateConfirmation;
    private String lieuTest;
    private String resultat;

    // Education thérapeutique
    private LocalDate dateDebutETP;
    private Integer ageETP;
    private String annonceComplete;
    private Integer ageAnnonce;

    // Vaccins
    private List<String> vaccins;
    private String autresVaccins;

    // PTME
    private String enfantProphylaxieArvNaissance;
    private String enfantProphylaxieCotrimoxazole;
    private List<String> enfantAlimentation;
    private Integer enfantSevrageAgeMois;
    private String enfantNumeroSeropositif;
    private String mereTritherapieGrossesse;

    // ARV
    private LocalDate dateDebutArv;
    private String protocoleInitialArv;
    private String protocoleActuelArv;
    private String arvStadeOmsInitial;
    private List<String> stadeOmsInitial;
    // Champs additionnels présents dans l'entité Page
    private String protocole;
    private String arv;
    private String dateDebutArv2;

    // Répondants
    private String repondant1Nom;
    private String repondant1Lien;
    private String repondant1Niveau;
    private String repondant1Profession;
    private String repondant1Tel;

    private String repondant2Nom;
    private String repondant2Lien;
    private String repondant2Niveau;
    private String repondant2Profession;
    private String repondant2Tel;

    // Infos médicales
    private String tuberculose;
    private String autresAnt;
    private String profession;
    private String statutFamilial;

    // Contact / Soutien
    private String personneContact;
    private String telephoneContact;
    private String soutienNom;
    private String soutienPrenoms;
    private String soutienLien;
    private String soutienTelephone;
    private String soutienAdresse;

    // TAR
    private String stadeOms;
    private LocalDate dateDebutTar;
    private String protocoleInitialTar;

    // Autres infos
    private Integer nbGrossessesPtme;
    private String contraception;
    private String prep;
    private String maladiesChroniques;
    private String autresMaladiesChroniques;

    // Liaison
    private String dossierCode;

    // Sous-entités
    private List<BilanDTO> bilans;
    private List<IndexTestDTO> indexTests;
    private List<PriseEnChargeTbDTO> priseEnChargeTbs;
    private List<PTMEDTO> ptmes;
    private List<SuiviImmunovirologiqueDTO> suiviImmunovirologiques;
    private List<SuiviPathologiqueDTO> suiviPathologiques;
    private List<SuiviARVDTO> suiviARVs;
    private List<DepistageFamilialeDTO> depistageFamiliales;
}
