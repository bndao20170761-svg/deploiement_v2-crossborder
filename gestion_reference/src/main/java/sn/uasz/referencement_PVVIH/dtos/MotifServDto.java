package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotifServDto {
    private Long id;
    private Boolean arv;
    private Boolean bilan;
    private Boolean io;
    private Boolean ptme;
    private Boolean suivi;
}
