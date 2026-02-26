package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProtocoleTherapDto {
    private Long id;
    private String therapie;
    private Date dateTherapie;
    private Long renseignementCliniqueId;
}
