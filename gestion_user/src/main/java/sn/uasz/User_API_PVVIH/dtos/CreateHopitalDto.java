package sn.uasz.User_API_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHopitalDto {
    private String nom;
    private String pays;
    private String ville;
    private Boolean active;
    private Double latitude;
    private Double longitude;
    private String adresseComplete;
    private String telephoneFixe;
    private String type;
    private List<CreateServiceDto> services; // DTO spécial pour création
}
