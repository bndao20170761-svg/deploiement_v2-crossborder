package sn.uasz.Patient_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HopitalDto {
    private Long id;
    private String nom;
    private String pays;
    private String ville;
    private Boolean active;
    private Double latitude;
    private Double longitude;
    private String type;
    private String adresseComplete;
    private String telephoneFixe;
    private LocalDateTime createdAt;
    private String createdByDoctorId;
    private String createdByDoctorName;
    private List<DoctorDto> doctors;
    private List<PrestataireDto> services;
}