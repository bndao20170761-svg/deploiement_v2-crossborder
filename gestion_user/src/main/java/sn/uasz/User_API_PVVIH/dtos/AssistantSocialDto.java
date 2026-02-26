package sn.uasz.User_API_PVVIH.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssistantSocialDto {

    private String codeAssistant;
    private String email;
    private String lieuExercice;
    private String pseudo;
    private String telephone;
    private Long hopitalId;
    private Long utilisateurId;
    private String nomUtilisateur;
    private String prenomUtilisateur;
    private String nationaliteUtilisateur;
    private String password;
}
