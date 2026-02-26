package sn.uasz.User_API_PVVIH.dtos;

import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDto {
    private Long id;
    private String type;
    private String serviceId;

    // 🔹 CHAMPS POUR LES PRESTATAIRES
    private String nomPrestataire;
    private String typePrestataire;
    private String specialitePrestataire;
    private String contactPrestataire;

    private Long hopitalId;
}