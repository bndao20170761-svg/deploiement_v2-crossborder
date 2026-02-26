package sn.uasz.User_API_PVVIH.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrestataireDto {
    private Long id;
    private String type;
    private String nom;
    private String specialite;
    private String telephone;
    private String email;
    private Long hopitalId; // ← AJOUTEZ ce champ pour la relation
}