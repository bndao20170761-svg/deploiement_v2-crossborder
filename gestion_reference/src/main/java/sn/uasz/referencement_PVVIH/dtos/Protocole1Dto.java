package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Protocole1Dto {
    private Long id;
    private String protocole1ereLigne;
    private Date dateProtocole1;
    private Long renseignementCliniqueId;
}
