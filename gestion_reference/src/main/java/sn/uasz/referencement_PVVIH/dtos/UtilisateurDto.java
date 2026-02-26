package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilisateurDto {
    private Long id;
    private String username;
    private Boolean active;
    private LocalDateTime dateCreation;
    private LocalDateTime dateDernierAcces;
    private String nationalite;
    private String nom;
    private String password;
    private String prenom;
    private String profil;
}
