package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProfilVIHDto {
    private Long id;
    private LocalDate dateConfirmation;
    private Boolean indetermine;
    private Boolean profil1;
    private Boolean profil12;
    private Boolean profil2;
    private Long referenceDossierId;
}
