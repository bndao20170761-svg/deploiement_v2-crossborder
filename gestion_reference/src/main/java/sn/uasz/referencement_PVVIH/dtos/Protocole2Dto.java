package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Protocole2Dto {
    private Long id;
    private String protocole2emeLigne;
    private Date dateProtocole2;
    private Long renseignementCliniqueId;
}
//