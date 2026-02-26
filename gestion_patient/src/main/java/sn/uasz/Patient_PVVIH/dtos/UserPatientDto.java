package sn.uasz.Patient_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPatientDto {
    private Long id;
    private String codePatient;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private LocalDate dateNaissance;
    private String adresse;
    private String ville;
    private String pays;
    private String nationalite;
    private String sexe;
    private String profession;
    private String situationMatrimoniale;
    private String niveauEducation;
    private String personneContact;
    private String telephoneContact;
    private String statut;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long utilisateurId;
    private String nomUtilisateur;
    private String prenomUtilisateur;
    private String nationaliteUtilisateur;
}