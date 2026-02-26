package sn.uasz.Patient_PVVIH.dtos;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDto {
    private String codePatient;
    private String adressePermanent;
    private String adresseTemporaire;
    private Long age;
    // Dans PatientDTO
    private DossierDTO  dossier;
    private String codeDossier;

    // Getter qui dérive la valeur
    public String getCodeDossier() {
        return dossier != null ? dossier.getCodeDossier() : null;
    }    private Date dateNaissance;
    private String profession;
    private String password;
    private String pseudo;
    private String sexe;
    private String statutMatrimoniale;
    private String telephone;
    private String nationalite;
    private String doctorCreateCode;
    private String username;
    private String nomUtilisateur;
    private String prenomUtilisateur;
    private String nationaliteUtilisateur;

    private Long utilisateurId;


}