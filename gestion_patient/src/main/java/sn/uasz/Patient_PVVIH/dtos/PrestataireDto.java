package sn.uasz.Patient_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrestataireDto {
    private Long id;
    private String type;
    private String prestataire;
    private String contact;
    private Long hopitalId;
}