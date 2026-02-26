package sn.uasz.User_API_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

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
    private String createdByDoctorId;
    private String createdByDoctorName;
    private List<DoctorDto> doctors;
    private List<ServiceDto> services;
    private List<PrestataireDto> prestataires; // ← Changez de List<Object> à List<PrestataireDto>
}