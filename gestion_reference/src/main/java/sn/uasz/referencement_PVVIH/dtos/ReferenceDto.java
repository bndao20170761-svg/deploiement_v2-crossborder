package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

/*
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class ReferenceDto { 
    private Long id;
    private Boolean active;
    private LocalDateTime date;
    private Boolean etat;
    private String site;
    private String statut;
    private String type;
    private Boolean validation;
    private AssistantSocialDto assistant;
    private String codeAssistant;
    private DoctorDto medecinAuteur;
    private DoctorDto medecin;
    private PatientDto patient;
    private HopitalDto hopital;
    private String motifReference;
    private String motifReferenceAutre;
    private String typeReference;
    private RenseignementCliniqueDto renseignementClinique;
    private MotifDto motif;
    private String patientId;
    private String codeDoctor;
    private String codeHopital;
    private String codeDocteur;
    private String nomDocteur;
    private String codeReferenceur;
    private String nomReferenceur;
    private String telephoneReferenceur;
    private String emailReferenceur;
    private String observations;

    public void setDateNowIfNull() {
        if (this.date == null) {
            this.date = LocalDateTime.now();
        }
    }

    // ✅ Retourner null si date est null pour éviter les erreurs JSON
    public String getDateIso() {
        return date != null ? date.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
    }

} */
