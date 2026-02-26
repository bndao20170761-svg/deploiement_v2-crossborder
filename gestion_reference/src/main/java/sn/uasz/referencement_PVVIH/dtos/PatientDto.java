package sn.uasz.referencement_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDto {
    private String codePatient;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private LocalDate dateNaissance;
    private String adresse;
    private String ville;
    private String pays;
    private String statut;
    private String genre;
    private String groupeSanguin;
    private String allergies;
    private String antecedents;
    
    // Propriétés attendues par le mapper existant
    private String username;
    private String doctorCreateCode;
    private Long utilisateurId;
    private String nomUtilisateur;
    private String prenomUtilisateur;
    private String nationaliteUtilisateur;
    
    // Propriétés supplémentaires attendues par PatientService
    private String nationalite;
    private String password;
    private String adressePermanent;
    private String adresseTemporaire;
    private Long age;
    private Date dateNaissanceUtilisateur;
    private String profession;
    private String pseudo;
    private String sexe;
    private String statutMatrimoniale;
}