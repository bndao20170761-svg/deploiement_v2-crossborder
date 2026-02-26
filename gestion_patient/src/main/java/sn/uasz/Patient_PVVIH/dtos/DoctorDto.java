package sn.uasz.Patient_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDto {
    private Long id;
    private String codeDoctor;
    private String nom;
    private String prenom;
    private String email;
    private String username; // username de l'utilisateur lié (JWT)
    private String telephone;
    private String specialite;
    private String hopitalNom;
    private Long hopitalId;
    private LocalDate dateNaissance;
    private String adresse;
    private String ville;
    private String pays;
    private String statut;
    private Long utilisateurId;
    private String nomUtilisateur;
    private String prenomUtilisateur;
    private String nationaliteUtilisateur;
}