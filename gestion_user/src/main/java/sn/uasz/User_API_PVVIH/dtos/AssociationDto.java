package sn.uasz.User_API_PVVIH.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssociationDto {
    private String codeAssociation;
    private String email;
    private String pays;
    private String pseudo;
    private String quartier;
    private String telephone;
    private String emailUser;

    private String ville;
    private Long utilisateurId; // juste l’id du User
}