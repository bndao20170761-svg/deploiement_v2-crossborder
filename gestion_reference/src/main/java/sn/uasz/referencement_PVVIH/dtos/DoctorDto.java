package sn.uasz.referencement_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDto {
    private String codeDoctor;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String specialite;
    private String hopitalNom;
    private Long hopitalId;
    private LocalDate dateNaissance;
    private String adresse;
    private String ville;
    private String pays;
    private String statut;
    
    // Propriétés attendues par le mapper existant
    private Long utilisateurId;
    private String nomUtilisateur;
    private String prenomUtilisateur;
    private String nationaliteUtilisateur;
}