package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Protocole2Dto {
    private Long id;
    private String protocole2emeLigne;
    private LocalDate dateProtocole2;
    private Long referenceDossierId;
}