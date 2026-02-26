package sn.uasz.referencement_PVVIH.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientFeignDto {
    private String codePatient;
    
    // Accepter "nom" OU "nomUtilisateur"
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String nomUtilisateur;
    private String nom;
    
    // Accepter "prenom" OU "prenomUtilisateur"
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String prenomUtilisateur;
    private String prenom;
    
    // Accepter "email" OU "username"
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String username;
    private String email;
    
    private String telephone;
    private LocalDate dateNaissance;
    
    // Accepter "adresse" OU "adressePermanent"
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String adressePermanent;
    private String adresse;
    
    private String ville;
    
    // Accepter "pays" OU "nationaliteUtilisateur" OU "nationalite"
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String nationaliteUtilisateur;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String nationalite;
    private String pays;
    
    private String statut;
    
    // Accepter "genre" OU "sexe"
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String sexe;
    private String genre;
    
    private String groupeSanguin;
    private String allergies;
    
    // Accepter "antecedents" OU "profession"
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String profession;
    private String antecedents;
    
    private String doctorCreateCode;
    
    // Champs supplémentaires pour compatibilité avec gestion_user
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Long age;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String adresseTemporaire;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String statutMatrimoniale;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String pseudo;
    
    // Méthodes pour normaliser les données après désérialisation
    public String getNom() {
        return nom != null ? nom : nomUtilisateur;
    }
    
    public String getPrenom() {
        return prenom != null ? prenom : prenomUtilisateur;
    }
    
    public String getEmail() {
        return email != null ? email : username;
    }
    
    public String getAdresse() {
        return adresse != null ? adresse : adressePermanent;
    }
    
    public String getPays() {
        if (pays != null) return pays;
        if (nationaliteUtilisateur != null) return nationaliteUtilisateur;
        return nationalite;
    }
    
    public String getGenre() {
        return genre != null ? genre : sexe;
    }
    
    public String getAntecedents() {
        return antecedents != null ? antecedents : profession;
    }
}





