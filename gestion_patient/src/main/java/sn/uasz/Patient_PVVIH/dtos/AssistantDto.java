package sn.uasz.Patient_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssistantDto {
    private Long id;
    private String codeAssistant;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
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