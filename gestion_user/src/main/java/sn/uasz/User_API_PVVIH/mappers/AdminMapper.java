package sn.uasz.User_API_PVVIH.mappers;

import org.mapstruct.*;
import org.mapstruct.factory.Mappers;
import sn.uasz.User_API_PVVIH.dtos.*;
import sn.uasz.User_API_PVVIH.entities.*;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface AdminMapper {

    AdminMapper INSTANCE = Mappers.getMapper(AdminMapper.class);

    // ========== ASSISTANT SOCIAL ==========
    @Mapping(target = "hopitalId", source = "hopital.id")
    @Mapping(target = "utilisateurId", source = "utilisateur.id")
    @Mapping(target = "nomUtilisateur", source = "utilisateur.nom")
    @Mapping(target = "prenomUtilisateur", source = "utilisateur.prenom")
    @Mapping(target = "nationaliteUtilisateur", source = "utilisateur.nationalite")
    AssistantSocialDto assistantSocialToDto(AssistantSocial assistantSocial);

    @Mapping(target = "hopital", ignore = true)
    @Mapping(target = "utilisateur", ignore = true)
    AssistantSocial dtoToAssistantSocial(AssistantSocialDto assistantSocialDto);

    // ========== ASSOCIATION ==========
    @Mapping(target = "utilisateurId", source = "utilisateur.id")
    AssociationDto associationToDto(Association association);

    @Mapping(target = "utilisateur", ignore = true)
    Association dtoToAssociation(AssociationDto associationDto);

    // ========== DOCTOR ==========
    @Mapping(target = "hopitalId", source = "hopital.id")
    @Mapping(target = "utilisateurId", source = "utilisateur.id")
    @Mapping(target = "nomUtilisateur", source = "utilisateur.nom")
    @Mapping(target = "prenomUtilisateur", source = "utilisateur.prenom")
    @Mapping(target = "nationaliteUtilisateur", source = "utilisateur.nationalite")
    @Mapping(target = "username", source = "utilisateur.username")
    @Mapping(target = "codeDoctor", source = "codeDoctor")
    DoctorDto doctorToDto(Doctor doctor);

    @Mapping(target = "hopital", ignore = true)
    @Mapping(target = "utilisateur", ignore = true)
    @Mapping(target = "codeDoctor", ignore = true)
    Doctor dtoToDoctor(DoctorDto doctorDto);

    // ========== HOPITAL ==========
    @Mapping(target = "createdByDoctorId", expression = "java(getCreatedByDoctorId(hopital.getCreatedByDoctor()))")
    @Mapping(target = "createdByDoctorName", expression = "java(getDoctorFullName(hopital.getCreatedByDoctor()))")
    @Mapping(target = "services", source = "services", qualifiedByName = "servicesToDtos")
    @Mapping(target = "doctors", source = "doctors", qualifiedByName = "doctorsToDtos")
    @Mapping(target = "prestataires", source = "prestataires", qualifiedByName = "prestatairesToDtos")
    HopitalDto hopitalToDto(Hopital hopital);

    @Mapping(target = "createdByDoctor", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "doctors", ignore = true)
    Hopital dtoToHopital(HopitalDto hopitalDto);

    // ========== MEMBRE ==========
    @Mapping(target = "associationCode", source = "association.codeAssociation")
    @Mapping(target = "associationPseudo", source = "association.pseudo")
    @Mapping(target = "utilisateurId", source = "utilisateur.id")
    @Mapping(target = "nomUtilisateur", source = "utilisateur.nom")
    @Mapping(target = "prenomUtilisateur", source = "utilisateur.prenom")
    @Mapping(target = "emailUser", source = "utilisateur.username")
    @Mapping(target = "nomCompletUtilisateur",
            expression = "java(membre.getUtilisateur().getPrenom() + \" \" + membre.getUtilisateur().getNom())")
    MembreDto membreToDto(Membre membre);

    @Mapping(target = "association", ignore = true)
    @Mapping(target = "utilisateur", ignore = true)
    Membre dtoToMembre(MembreDto membreDto);

    // ========== PATIENT ==========
    @Mapping(target = "nomUtilisateur", source = "utilisateur.nom")
    @Mapping(target = "prenomUtilisateur", source = "utilisateur.prenom")
    @Mapping(target = "nationaliteUtilisateur", source = "utilisateur.nationalite")
    @Mapping(target = "doctorCreateCode", source = "doctorCreate.codeDoctor")
    @Mapping(target = "utilisateurId", source = "utilisateur.id")
    PatientDto patientToDto(Patient patient);

    @Mapping(target = "doctorCreate", ignore = true)
    @Mapping(target = "utilisateur", ignore = true)
    Patient dtoToPatient(PatientDto patientDto);

    // ========== SERVICE ==========
    @Mapping(target = "hopitalId", source = "hopital.id")
    @Mapping(target = "nomPrestataire", source = "nomPrestataire")
    @Mapping(target = "typePrestataire", source = "typePrestataire")
    @Mapping(target = "specialitePrestataire", source = "specialitePrestataire")
    @Mapping(target = "contactPrestataire", source = "contactPrestataire")
    ServiceDto serviceToDto(Service service);

    @Mapping(target = "hopital", ignore = true)
    @Mapping(target = "nomPrestataire", source = "nomPrestataire")
    @Mapping(target = "typePrestataire", source = "typePrestataire")
    @Mapping(target = "specialitePrestataire", source = "specialitePrestataire")
    @Mapping(target = "contactPrestataire", source = "contactPrestataire")
    Service dtoToService(ServiceDto serviceDto);

    // ========== PRESTATAIRE ==========
    @Mapping(target = "hopitalId", source = "hopital.id")
    PrestataireDto prestataireToDto(Prestataire prestataire);

    @Mapping(target = "hopital", expression = "java(mapHopitalId(prestataireDto.getHopitalId()))")
    Prestataire dtoToPrestataire(PrestataireDto prestataireDto);

    // ========== MÉTHODES DE MAPPING PERSONNALISÉES ==========

    @Named("servicesToDtos")
    default List<ServiceDto> servicesToDtos(List<Service> services) {
        if (services == null) {
            return null;
        }
        return services.stream()
                .map(this::serviceToDto)
                .collect(Collectors.toList());
    }

    @Named("doctorsToDtos")
    default List<DoctorDto> doctorsToDtos(List<Doctor> doctors) {
        if (doctors == null) {
            return null;
        }
        return doctors.stream()
                .map(this::doctorToDto)
                .collect(Collectors.toList());
    }

    @Named("prestatairesToDtos")
    default List<PrestataireDto> prestatairesToDtos(List<Prestataire> prestataires) {
        if (prestataires == null) {
            return null;
        }
        return prestataires.stream()
                .map(this::prestataireToDto)
                .collect(Collectors.toList());
    }

    // ========== MÉTHODES UTILITAIRES POUR LES IDs ==========
    default Hopital mapHopitalId(Long id) {
        if (id == null) return null;
        return Hopital.builder().id(id).build();
    }

    default Association mapAssociationCode(String code) {
        if (code == null) return null;
        return Association.builder().codeAssociation(code).build();
    }

    default User mapUtilisateurId(Long id) {
        if (id == null) return null;
        return User.builder().id(id).build();
    }

    default Doctor mapDoctorCreateCode(String code) {
        if (code == null) return null;
        return Doctor.builder().codeDoctor(code).build();
    }

    default Doctor mapCreatedByDoctorId(String codeDoctor) {
        if (codeDoctor == null) return null;
        return Doctor.builder().codeDoctor(codeDoctor).build();
    }

    // ========== MÉTHODES UTILITAIRES POUR LES NOMS ==========
    default String getDoctorFullName(Doctor doctor) {
        if (doctor == null || doctor.getUtilisateur() == null) {
            return null;
        }
        return doctor.getUtilisateur().getPrenom() + " " + doctor.getUtilisateur().getNom();
    }

    // ========== MÉTHODE UTILITAIRE POUR L'ID DU DOCTEUR CREATEUR ==========
    default String getCreatedByDoctorId(Doctor doctor) {
        if (doctor == null) {
            return null;
        }
        return doctor.getCodeDoctor();
    }

    // ========== MÉTHODES DE MISE À JOUR ==========
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateHopitalFromDto(HopitalDto hopitalDto, @MappingTarget Hopital hopital);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateServiceFromDto(ServiceDto serviceDto, @MappingTarget Service service);
}