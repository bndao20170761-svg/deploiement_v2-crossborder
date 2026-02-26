package sn.uasz.referencement_PVVIH.mappers;

import org.mapstruct.*;
import sn.uasz.referencement_PVVIH.dtos.*;
import sn.uasz.referencement_PVVIH.entities.*;
import java.util.ArrayList;
import java.util.List;

@Mapper(
        componentModel = "spring",
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        builder = @Builder(disableBuilder = true)
)





public interface ReferenceMapper {




    // === Méthodes personnalisées pour listes ===
    default RenseignementCliniqueDto toRenseignementCliniqueDtoFromList(List<RenseignementClinique> list) {
        if (list == null || list.isEmpty()) return null;
        return toRenseignementCliniqueDto(list.get(0));
    }

    default List<RenseignementClinique> toRenseignementCliniqueListFromDto(RenseignementCliniqueDto dto) {
        if (dto == null) return new ArrayList<>();
        List<RenseignementClinique> list = new ArrayList<>();
        list.add(toRenseignementClinique(dto));
        return list;
    }

    default MotifDto toMotifDtoFromList(List<Motif> list) {
        if (list == null || list.isEmpty()) return null;
        return toMotifDto(list.get(0));
    }

    default List<Motif> toMotifListFromDto(MotifDto dto) {
        if (dto == null) return new ArrayList<>();
        List<Motif> list = new ArrayList<>();
        list.add(toMotif(dto));
        return list;
    }


    default ReferenceValidationDto toReferenceValidationDto(Reference ref) {
        if (ref == null) return null;

        ReferenceValidationDto dto = new ReferenceValidationDto();
        dto.setId(ref.getId());
        dto.setValidation(ref.getValidation()); // ✅ correction ici

        dto.setMedecinAuteurId(
                (ref.getMedecinAuteur() != null) ? ref.getMedecinAuteur().getCodeDoctor() : ""
        );


        dto.setMedecinAuteurNom(
                (ref.getMedecinAuteur() != null && ref.getMedecinAuteur().getUtilisateur() != null)
                        ? ref.getMedecinAuteur().getUtilisateur().getNom()
                        : ""
        );

        return dto;
    }


    // === Mapping Reference ===
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
    @Mapping(target = "motifs", source = "motif")
    Reference toReference(ReferenceDto dto);

    // === Mapping ContreReference ===
    @Mapping(source = "reference.id", target = "referenceId")
    ContreReferenceDto toContreReferenceDto(ContreReference contreReference);

    @InheritInverseConfiguration
    ContreReference toContreReference(ContreReferenceDto dto);

    // === Mapping Doctor ===
    @Mapping(source = "hopital.id", target = "hopitalId")
    @Mapping(source = "utilisateur.id", target = "utilisateurId")
    @Mapping(source = "utilisateur.nom", target = "nomUtilisateur")
    @Mapping(source = "utilisateur.prenom", target = "prenomUtilisateur")
    @Mapping(source = "utilisateur.nationalite", target = "nationaliteUtilisateur")
    DoctorDto toDoctorDto(Doctor doctor);

    @InheritInverseConfiguration
    Doctor toDoctor(DoctorDto doctorDto);

    List<DoctorDto> toDoctorDtoList(List<Doctor> doctors);
    List<Doctor> toDoctorList(List<DoctorDto> doctorDtos);

    // === Mapping Patient ===
    @Mapping(source = "utilisateur.username", target = "username")
    @Mapping(source = "doctorCreate.codeDoctor", target = "doctorCreateCode")
    @Mapping(source = "utilisateur.id", target = "utilisateurId")
    @Mapping(source = "utilisateur.nom", target = "nomUtilisateur")
    @Mapping(source = "utilisateur.prenom", target = "prenomUtilisateur")
    @Mapping(source = "utilisateur.nationalite", target = "nationaliteUtilisateur")
    @Mapping(source = "codePatient", target = "codePatient")
    PatientDto toPatientDto(Patient patient);

    @InheritInverseConfiguration
    Patient toPatient(PatientDto patientDto);

    List<PatientDto> toPatientDtoList(List<Patient> patients);
    List<Patient> toPatientList(List<PatientDto> patientDtos);

    // === Mapping RenseignementClinique ===

    RenseignementCliniqueDto toRenseignementCliniqueDto(RenseignementClinique entity);
    @InheritInverseConfiguration
    RenseignementClinique toRenseignementClinique(RenseignementCliniqueDto dto);

    // === Mapping Protocole ===
    Protocole1Dto toProtocole1Dto(Protocole1 entity);
    @InheritInverseConfiguration
    Protocole1 toProtocole1(Protocole1Dto dto);

    Protocole2Dto toProtocole2Dto(Protocole2 entity);
    @InheritInverseConfiguration
    Protocole2 toProtocole2(Protocole2Dto dto);

    ProtocoleTherapDto toProtocoleTherapDto(ProtocoleTherap entity);
    @InheritInverseConfiguration
    ProtocoleTherap toProtocoleTherap(ProtocoleTherapDto dto);

    // === Mapping Renseignements divers ===
    RenseignementProfilDto toRenseignementProfilDto(RenseignementProfil entity);
    @InheritInverseConfiguration
    RenseignementProfil toRenseignementProfil(RenseignementProfilDto dto);

    RenseignementStadeDto toRenseignementStadeDto(RenseignementStade entity);
    @InheritInverseConfiguration
    RenseignementStade toRenseignementStade(RenseignementStadeDto dto);

    // === Mapping Motif ===
    MotifDto toMotifDto(Motif motif);
    @InheritInverseConfiguration
    Motif toMotif(MotifDto dto);

    // === Mapping MotifAutres personnalisé ===
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
    }

    // === Mapping MotifChangement ===
    MotifChangementDto toMotifChangementDto(MotifChangement entity);
    @InheritInverseConfiguration
    MotifChangement toMotifChangement(MotifChangementDto dto);

    // === Mapping MotifServ ===
    MotifServDto toMotifServDto(MotifServ entity);
    @InheritInverseConfiguration
    MotifServ toMotifServ(MotifServDto dto);

    // === Mapping Hopital ===
    @Mapping(source = "doctors", target = "doctors")
    @Mapping(source = "services", target = "services")
    HopitalDto toHopitalDto(Hopital hopital);

    @InheritInverseConfiguration
    @Mapping(target = "doctors", ignore = true) // Géré séparément si nécessaire
    @Mapping(target = "services", ignore = true) // Géré séparément si nécessaire
    Hopital toHopital(HopitalDto hopitalDto);

    List<HopitalDto> toHopitalDtoList(List<Hopital> hopitals);
    List<Hopital> toHopitalList(List<HopitalDto> hopitalDtos);

    // === Mapping Service ===
    @Mapping(source = "hopital.id", target = "hopitalId")
    ServiceDto toServiceDto(Service service);

    @InheritInverseConfiguration
    @Mapping(target = "hopital", ignore = true) // À gérer manuellement
    Service toService(ServiceDto serviceDto);

    List<ServiceDto> toServiceDtoList(List<Service> services);
    List<Service> toServiceList(List<ServiceDto> serviceDtos);
}
