package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotifDto {
    private Long id;
    private Boolean autresAPreciser;
    private Boolean changementAdresse;
    private Boolean services;

    private List<ReferenceDto> references;
    private MotifAutresDto motifAutres;
    private MotifChangementDto motifChangements;
    private MotifServDto motifServs;
}
