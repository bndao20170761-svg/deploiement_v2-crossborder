package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RenseignementStadeDto {
    private Long id;
    private Boolean stade1;
    private Boolean stade2;
    private Boolean stade3;
    private Boolean stade4;
    private Long renseignementCliniqueId;
}
