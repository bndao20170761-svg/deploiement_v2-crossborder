package sn.uasz.referencement_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrestataireDto {
    private Long id;
    private String type;
    private String nom;
    private String specialite;
    private String telephone;
    private String email;
    private Long hopitalId;
}
