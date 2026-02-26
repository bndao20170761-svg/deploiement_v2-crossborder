package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotifChangementDto {
    private Long id;
    private Boolean permanent;
    private Boolean temporaire;
}
