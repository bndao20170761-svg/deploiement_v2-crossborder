package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

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
    private String codeMedecinAuteur;
    private String codeMedecin;
    private String patientId;
    private DoctorDto medecin;         // destinataire
    private DoctorDto medecinAuteur;   // auteur
    private PatientDto patient;         // patient
    private RenseignementCliniqueDto renseignementClinique;
     // auteur


    // ✅ un seul objet et non une liste
    private MotifDto motif;



    private String nomUtilisateur;
    private String prenomUtilisateur;
    private String nationaliteUtilisateur;
    HopitalDto  hopitalDto;
    private Long utilisateurId;

    public void setDateNowIfNull() {
        if (this.date == null) {
            this.date = LocalDateTime.now();
        }
    }

    // ✅ Retourner null si date est null pour éviter les erreurs JSON
    public String getDateIso() {
        return date != null ? date.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
    }

}
