package sn.uasz.User_API_PVVIH.dtos;

import lombok.*;

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

    private Date dateNaissance;
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