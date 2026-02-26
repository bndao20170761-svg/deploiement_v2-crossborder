package sn.uasz.Patient_PVVIH.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String username;
    @NotBlank private String password;
    // Tu peux ajouter email, nom, etc. si besoin
    @NotBlank
    private String nom;
    @NotBlank
    private String profil;
    @NotBlank
    private String prenom;
    @NotBlank
    private String nationalite;
    @NotBlank
    private boolean actif;
}