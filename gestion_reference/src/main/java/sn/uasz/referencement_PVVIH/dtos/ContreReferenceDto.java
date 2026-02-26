package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContreReferenceDto {
    private Long id;
    private Date date;
    private Boolean etat;
    private Long referenceId;
}
