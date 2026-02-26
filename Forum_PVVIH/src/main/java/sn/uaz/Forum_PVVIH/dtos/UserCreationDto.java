package sn.uaz.Forum_PVVIH.dtos;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class UserCreationDto {
    
    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    private String username;
    
    @Email(message = "Format d'email invalide")
    private String email;
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit avoir au moins 6 caractères")
    private String password;
    
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    
    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;
    
    private String nationalite;
    private String languePreferee;
}