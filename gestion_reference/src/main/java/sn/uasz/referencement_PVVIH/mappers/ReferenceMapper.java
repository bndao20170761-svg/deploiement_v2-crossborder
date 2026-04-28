package sn.uasz.referencement_PVVIH.mappers;

import org.mapstruct.*;
import sn.uasz.referencement_PVVIH.dtos.*;
import sn.uasz.referencement_PVVIH.entities.*;
import java.util.ArrayList;
import java.util.List;

/*
@Mapper(
        componentModel = "spring",
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        builder = @Builder(disableBuilder = true)
)




public interface ReferenceMapper { */




    /* // === Méthodes personnalisées pour listes ===
    default RenseignementCliniqueDto toRenseignementCliniqueDtoFromList(List<RenseignementClinique> list) {
        if (list == null || list.isEmpty()) return null;
        return toRenseignementCliniqueDto(list.get(0));
    } */

    /* default List<RenseignementClinique> toRenseignementCliniqueListFromDto(RenseignementCliniqueDto dto) {
        if (dto == null) return new ArrayList<>();
        List<RenseignementClinique> list = new ArrayList<>();
        list.add(toRenseignementClinique(dto));
        return list;
    } */

    /* default MotifDto toMotifDtoFromList(List<Motif> list) {
        if (list == null || list.isEmpty()) return null;
        return toMotifDto(list.get(0));
    } */

    /* default List<Motif> toMotifListFromDto(MotifDto dto) {
        if (dto == null) return new ArrayList<>();
        List<Motif> list = new ArrayList<>();
        list.add(toMotif(dto));
        return list;
    } */


    /* default ReferenceValidationDto toReferenceValidationDto(Reference ref) {
        if (ref == null) return null;
        return ReferenceValidationDto.builder()
                .id(ref.getId())
                .date(ref.getDate())
                .medecinAuteur(ref.getMedecinAuteur() != null ? DoctorDto.builder()
                        .codeDoctor(ref.getMedecinAuteur().getCodeDoctor())
                        .nomComplet(ref.getMedecinAuteur().getNomComplet())
                        .build() : null)
                .medecin(ref.getMedecin() != null ? DoctorDto.builder()
                        .codeDoctor(ref.getMedecin().getCodeDoctor())
                        .nomComplet(ref.getMedecin().getNomComplet())
                        .build() : null)
                .patient(ref.getPatient() != null ? PatientDto.builder()
                        .codePatient(ref.getPatient().getCodePatient())
                        .nomUtilisateur(ref.getPatient().getNomUtilisateur())
                        .prenomUtilisateur(ref.getPatient().getPrenomUtilisateur())
                        .build() : null)
                .hopital(ref.getHopital() != null ? HopitalDto.builder()
                        .id(ref.getHopital().getId())
                        .nom(ref.getHopital().getNom())
                        .build() : null)
                .assistantSocial(ref.getAssistantSocial() != null ? AssistantSocialDto.builder()
                        .codeAssistant(ref.getAssistantSocial().getCodeAssistant())
                        .build() : null)
                .validation(ref.getValidation())
                .build();
    } */


    /* // === Mapping Reference ===
    @Mapping(source = "patient", target = "patient")
    @Mapping(source = "medecin", target = "medecin")
    @Mapping(source = "medecinAuteur", target = "medecinAuteur")
    @Mapping(source = "assistantSocial.codeAssistant", target = "codeAssistant")
    @Mapping(source = "medecinAuteur.codeDoctor", target = "codeMedecinAuteur")
    @Mapping(source = "medecin.codeDoctor", target = "codeMedecin")
    @Mapping(source = "patient.codePatient", target = "patientId")
    @Mapping(source = "renseignementsCliniques", target = "renseignementClinique")
    @Mapping(source = "motifs", target = "motif")
    ReferenceDto toReferenceDto(Reference reference);

    @InheritInverseConfiguration
    @Mapping(target = "renseignementsCliniques", source = "renseignementClinique")
    @Mapping(target = "motifs", source = "motif") */
    /* Reference toReference(ReferenceDto dto);

    // === Mapping ContreReference ===
    @Mapping(source = "reference.id", target = "referenceId")
    ContreReferenceDto toContreReferenceDto(ContreReference contreReference);

    @InheritInverseConfiguration
    ContreReference toContreReference(ContreReferenceDto dto);

    // === Mapping Doctor === */
    /* @Mapping(source = "hopital.id", target = "hopitalId")
    @Mapping(source = "utilisateur.id", target = "utilisateurId")
    @Mapping(source = "utilisateur.nom", target = "nomUtilisateur")
    @Mapping(source = "utilisateur.prenom", target = "prenomUtilisateur")
    @Mapping(source = "utilisateur.nationalite", target = "nationaliteUtilisateur")
    DoctorDto toDoctorDto(Doctor doctor);

    @InheritInverseConfiguration
    Doctor toDoctor(DoctorDto doctorDto); */

    /* List<DoctorDto> toDoctorDtoList(List<Doctor> doctors);
    List<Doctor> toDoctorList(List<DoctorDto> doctorDtos);

    // === Mapping Patient ===
    @Mapping(source = "utilisateur.username", target = "username")
    @Mapping(source = "doctorCreate.codeDoctor", target = "doctorCreateCode")
    @Mapping(source = "utilisateur.id", target = "utilisateurId")
    @Mapping(source = "utilisateur.nom", target = "nomUtilisateur")
    @Mapping(source = "utilisateur.prenom", target = "prenomUtilisateur") */
    /* @Mapping(source = "utilisateur.nationalite", target = "nationaliteUtilisateur")
    @Mapping(source = "codePatient", target = "codePatient")
    PatientDto toPatientDto(Patient patient);

    @InheritInverseConfiguration
    Patient toPatient(PatientDto patientDto);

    List<PatientDto> toPatientDtoList(List<Patient> patients);
    List<Patient> toPatientList(List<PatientDto> patientDtos); */

    /* // === Mapping RenseignementClinique ===

    RenseignementCliniqueDto toRenseignementCliniqueDto(RenseignementClinique entity);
    @InheritInverseConfiguration
    RenseignementClinique toRenseignementClinique(RenseignementCliniqueDto dto);

    // === Mapping Protocole ===
    Protocole1Dto toProtocole1Dto(Protocole1 entity);
    @InheritInverseConfiguration */
    /* Protocole1 toProtocole1(Protocole1Dto dto);

    Protocole2Dto toProtocole2Dto(Protocole2 entity);
    @InheritInverseConfiguration
    Protocole2 toProtocole2(Protocole2Dto dto);

    ProtocoleTherapDto toProtocoleTherapDto(ProtocoleTherap entity);
    @InheritInverseConfiguration
    ProtocoleTherap toProtocoleTherap(ProtocoleTherapDto dto); */

    /* // === Mapping Renseignements divers ===
    RenseignementProfilDto toRenseignementProfilDto(RenseignementProfil entity);
    @InheritInverseConfiguration
    RenseignementProfil toRenseignementProfil(RenseignementProfilDto dto);

    RenseignementStadeDto toRenseignementStadeDto(RenseignementStade entity);
    @InheritInverseConfiguration
    RenseignementStade toRenseignementStade(RenseignementStadeDto dto); */

    /* // === Mapping Motif ===
    @Mapping(target = "reference", ignore = true)
    MotifDto toMotifDto(Motif motif);

    @InheritInverseConfiguration
    @Mapping(target = "reference", ignore = true)
    @Mapping(target = "id", ignore = true)
    Motif toMotif(MotifDto motifDto); */

    /* // === Mapping MotifAutres personnalisé ===
    default MotifAutres toMotifAutres(MotifAutresDto dto) {
        if (dto == null) return null;
        return MotifAutres.builder()
                .autresMotif(dto.getAutresMotif() != null ? dto.getAutresMotif() : "")
                .build();
    }

    default MotifAutresDto toMotifAutresDto(MotifAutres entity) {
        if (entity == null) return null;
        return MotifAutresDto.builder()
                .autresMotif(entity.getAutresMotif())
                .build();
    } */

    /* // === Mapping MotifChangement ===
    MotifChangementDto toMotifChangementDto(MotifChangement entity);
    @InheritInverseConfiguration
    @Mapping(target = "id", ignore = true)
    MotifChangement toMotifChangement(MotifChangementDto dto);

    // === Mapping MotifServ ===
    MotifServDto toMotifServDto(MotifServ entity);
    @InheritInverseConfiguration */
    /* @Mapping(target = "id", ignore = true)
    MotifServ toMotifServ(MotifServDto dto);

    // === Mapping Hopital ===
    @Mapping(source = "doctors", target = "doctors")
    @Mapping(source = "services", target = "services")
    HopitalDto toHopitalDto(Hopital hopital);

    @InheritInverseConfiguration
    @Mapping(target = "doctors", ignore = true) // Géré séparément si nécessaire
    @Mapping(target = "services", ignore = true) // Géré séparément si nécessaire
    Hopital toHopital(HopitalDto hopitalDto);

    List<HopitalDto> toHopitalDtoList(List<Hopital> hopitaux);
    List<Hopital> toHopitalList(List<HopitalDto> hopitalDtos);

    // === Mapping AssistantSocial ===
    @Mapping(source = "hopital.id", target = "hopitalId")
    @Mapping(source = "hopital.nom", target = "hopitalNom")
    AssistantSocialDto toAssistantSocialDto(AssistantSocial assistantSocial);

    @InheritInverseConfiguration
    @Mapping(target = "hopital", ignore = true) // Géré séparément si nécessaire
    AssistantSocial toAssistantSocial(AssistantSocialDto assistantSocialDto);

    List<AssistantSocialDto> toAssistantSocialDtoList(List<AssistantSocial> assistantSocials);
    List<AssistantSocial> toAssistantSocialList(List<AssistantSocialDto> assistantSocialDtos);

    // === Mapping Service ===
    @Mapping(source = "hopital.id", target = "hopitalId")
    ServiceDto toServiceDto(Service service);

    @InheritInverseConfiguration
    @Mapping(target = "hopital", ignore = true) // À gérer manuellement
    Service toService(ServiceDto serviceDto);

    List<ServiceDto> toServiceDtoList(List<Service> services);
    List<Service> toServiceList(List<ServiceDto> serviceDtos);

    // === Mapping ReferenceValidation ===
    ReferenceValidationDto toReferenceValidationDto(Reference reference);

    // === Mapping RenseignementClinique ===
    @Mapping(target = "reference", ignore = true)
    @Mapping(target = "protocoles1s", ignore = true)
    @Mapping(target = "protocoles2s", ignore = true)
    @Mapping(target = "protocolesTheraps", ignore = true)
    @Mapping(target = "profils", ignore = true)
    @Mapping(target = "stades", ignore = true)
    RenseignementCliniqueDto toRenseignementCliniqueDto(RenseignementClinique rc);

    @InheritInverseConfiguration
    @Mapping(target = "reference", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "protocoles1s", ignore = true)
    @Mapping(target = "protocoles2s", ignore = true)
    @Mapping(target = "protocolesTheraps", ignore = true)
    @Mapping(target = "profils", ignore = true)
    @Mapping(target = "stades", ignore = true)
    RenseignementClinique toRenseignementClinique(RenseignementCliniqueDto rcDto);

    // === Mapping MotifAutres ===
    MotifAutresDto toMotifAutresDto(MotifAutres motifAutres);

    @InheritInverseConfiguration
    @Mapping(target = "id", ignore = true)
    MotifAutres toMotifAutres(MotifAutresDto motifAutresDto);

    // === Mapping MotifChangement ===
    MotifChangementDto toMotifChangementDto(MotifChangement motifChangement);

    @InheritInverseConfiguration
    @Mapping(target = "id", ignore = true)
    MotifChangement toMotifChangement(MotifChangementDto motifChangementDto);

    // === Mapping MotifServ ===
    MotifServDto toMotifServDto(MotifServ motifServ);

    @InheritInverseConfiguration
    @Mapping(target = "id", ignore = true)
    MotifServ toMotifServ(MotifServDto motifServDto);

    // === Mapping Protocole1 ===
    @Mapping(target = "referenceDossier", ignore = true)
    Protocole1Dto toProtocole1Dto(Protocole1 protocole1);

    @InheritInverseConfiguration
    @Mapping(target = "referenceDossier", ignore = true)
    @Mapping(target = "id", ignore = true)
    Protocole1 toProtocole1(Protocole1Dto protocole1Dto);

    // === Mapping Protocole2 ===
    @Mapping(target = "referenceDossier", ignore = true)
    Protocole2Dto toProtocole2Dto(Protocole2 protocole2);

    @InheritInverseConfiguration
    @Mapping(target = "referenceDossier", ignore = true)
    @Mapping(target = "id", ignore = true)
    Protocole2 toProtocole2(Protocole2Dto protocole2Dto);

    // === Mapping ProtocoleTherap ===
    @Mapping(target = "referenceDossier", ignore = true)
    ProtocoleTherapDto toProtocoleTherapDto(ProtocoleTherap protocoleTherap);

    @InheritInverseConfiguration
    @Mapping(target = "referenceDossier", ignore = true)
    @Mapping(target = "id", ignore = true)
    ProtocoleTherap toProtocoleTherap(ProtocoleTherapDto protocoleTherapDto);

    // === Mapping ProfilVIH ===
    @Mapping(target = "referenceDossier", ignore = true)
    ProfilVIHDto toProfilVIHDto(ProfilVIH profilVIH);

    @InheritInverseConfiguration
    @Mapping(target = "referenceDossier", ignore = true)
    @Mapping(target = "id", ignore = true)
    ProfilVIH toProfilVIH(ProfilVIHDto profilVIHDto);

    // === Mapping StadeOMS ===
    @Mapping(target = "referenceDossier", ignore = true)
    StadeOMSDto toStadeOMSDto(StadeOMS stadeOMS);

    @InheritInverseConfiguration
    @Mapping(target = "referenceDossier", ignore = true)
    @Mapping(target = "id", ignore = true)
    StadeOMS toStadeOMS(StadeOMSDto stadeOMSDto);

    // === Mapping Reference ===
    @Mapping(target = "motifs", ignore = true)
    @Mapping(target = "renseignementsCliniques", ignore = true)
    ReferenceDto toReferenceDto(Reference reference);

    @Mapping(target = "motifs", ignore = true)
    @Mapping(target = "renseignementsCliniques", ignore = true)
    @Mapping(target = "id", ignore = true)
    Reference toReference(ReferenceDto referenceDto);
} */
