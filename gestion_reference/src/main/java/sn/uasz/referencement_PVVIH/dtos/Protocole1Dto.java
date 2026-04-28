package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Protocole1Dto {
    private Long id;
    private String protocole1ereLigne;
    private LocalDate dateProtocole1;
    private Long referenceDossierId;
}
