package sn.uasz.User_API_PVVIH.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorDto {

    private String codeDoctor;
    private String email;
    private String fonction;
    private String lieuExercice;
    private String pseudo;
    private String telephone;
    private Long hopitalId;
    private Long utilisateurId;
    private String nomUtilisateur;
    private String prenomUtilisateur;
    private String nationaliteUtilisateur;
    private String username; // Username de l'utilisateur lié (pour la correspondance JWT)
    private String password;



}