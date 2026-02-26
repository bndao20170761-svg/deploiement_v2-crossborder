package sn.uasz.referencement_PVVIH.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorFeignDto {
    private String codeDoctor;
    
    @JsonProperty("nomUtilisateur")
    private String nom;
    
    @JsonProperty("prenomUtilisateur")
    private String prenom;
    
    private String email;
    private String telephone;
    
    @JsonProperty("fonction")
    private String specialite;
    
    private String hopitalNom;
    private Long hopitalId;
    private LocalDate dateNaissance;
    private String adresse;
    private String ville;
    private String pays;
    private String statut;
    
    // ✅ Ajout du champ username pour la recherche
    private String username;
    private String pseudo;
    private String lieuExercice;
}




