package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RenseignementProfilDto {
    private Long id;
    private Date dateConfirmation;
    private Boolean indetermine;
    private Boolean profil1;
    private Boolean profil12;
    private Boolean profil2;
    private Long renseignementCliniqueId;
}
