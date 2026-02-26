package sn.uasz.referencement_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sn.uasz.referencement_PVVIH.dtos.DoctorDto;
import sn.uasz.referencement_PVVIH.dtos.ServiceDto;
import sn.uasz.referencement_PVVIH.dtos.PrestataireDto;

import java.time.LocalDateTime;
import java.util.List;

// ⚠️ AJOUTEZ @Builder, @NoArgsConstructor, @AllArgsConstructor
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HopitalDto {
    private Long id;
    private String nom;
    private String pays;
    private String ville;
    private Boolean active;
    private Double latitude;
    private String type;

    private Double longitude;
    private String adresseComplete;
    private String telephoneFixe;
    private LocalDateTime createdAt;
    private String createdByDoctorId; // NOUVEAU
    private String createdByDoctorName;
    private List<DoctorDto> doctors;
    private List<ServiceDto> services;
    private List<PrestataireDto> prestataires;
}