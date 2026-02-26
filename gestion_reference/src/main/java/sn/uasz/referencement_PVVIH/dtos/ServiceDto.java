package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDto {
    private Long id;
    private String type;
    private String prestataire;
    private String contact;
    private Long hopitalId;

    // Ajouter ce constructeur pour la désérialisation depuis String
    @JsonCreator
    public ServiceDto(@JsonProperty("type") String type) {
        this.type = type;
        this.prestataire = "";
        this.contact = "";
    }
}