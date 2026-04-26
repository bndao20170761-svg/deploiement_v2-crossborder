package sn.uasz.referencement_PVVIH.dtos;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReferenceDossierDto {
    private Long id;
    private String codeReference;
    private String codeDossier;
    private String codePatient;
    private String nomPatient;
    private String prenomPatient;
    private String codeHopital;
    private String nomHopital;
    private String codeHopitalReferenceur;
    private String nomHopitalReferenceur;
    private String codeDocteur;
    private String nomDocteur;
    private String motifReference;
    private String typeReference;
    private LocalDateTime dateReference;
    private LocalDateTime datePriseEnCharge;
    private String statut;
    private String observations;
    private String codeReferenceur;
    private String nomReferenceur;
    private String telephoneReferenceur;
    private String emailReferenceur;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
}
