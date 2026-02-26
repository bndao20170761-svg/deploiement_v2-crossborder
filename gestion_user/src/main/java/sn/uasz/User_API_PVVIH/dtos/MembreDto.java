package sn.uasz.User_API_PVVIH.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembreDto {
    private Long id;
    private String code;
    private String pseudo;
    private String associationCode;
    private String associationPseudo; // Ajoutez ce champ
    private Long utilisateurId;
    private String nomUtilisateur; // Ajoutez ce champ
    private String prenomUtilisateur; // Ajoutez ce champ
    private String emailUser; // Ajoutez ce champ
    private String nomCompletUtilisateur;
    private String password; // Ajoutez ce champ
}