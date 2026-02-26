package sn.uasz.referencement_PVVIH.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sn.uasz.referencement_PVVIH.dtos.PatientDto;
import sn.uasz.referencement_PVVIH.dtos.PatientFeignDto;

import java.time.LocalDate;
import java.time.Period;

@Mapper(componentModel = "spring")
public interface PatientMapper {

    /**
     * Convertit PatientFeignDto vers PatientDto pour l'usage interne
     */
    @Mapping(target = "utilisateurId", ignore = true)
    @Mapping(target = "nomUtilisateur", source = "nom")
    @Mapping(target = "prenomUtilisateur", source = "prenom")
    @Mapping(target = "nationaliteUtilisateur", ignore = true)
    @Mapping(target = "username", source = "email")
    @Mapping(target = "doctorCreateCode", source = "doctorCreateCode")
    @Mapping(target = "nationalite", source = "pays")
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "adressePermanent", source = "adresse")
    @Mapping(target = "adresseTemporaire", ignore = true)
    @Mapping(target = "age", expression = "java(calculateAge(dto.getDateNaissance()))")
    @Mapping(target = "dateNaissance", source = "dateNaissance")
    @Mapping(target = "profession", source = "antecedents")
    @Mapping(target = "pseudo", source = "nom")
    @Mapping(target = "sexe", source = "genre")
    @Mapping(target = "statutMatrimoniale", ignore = true)
    @Mapping(target = "codePatient", source = "codePatient")
    @Mapping(target = "telephone", source = "telephone")
    @Mapping(target = "ville", source = "ville")
    @Mapping(target = "statut", source = "statut")
    @Mapping(target = "groupeSanguin", source = "groupeSanguin")
    @Mapping(target = "allergies", source = "allergies")
    @Mapping(target = "antecedents", source = "antecedents")
    PatientDto toPatientDto(PatientFeignDto dto);

    /**
     * Convertit PatientDto vers PatientFeignDto pour la communication Feign
     * Tous les champs sont mappés pour envoyer les données complètes à gestion_user
     */
    @Mapping(target = "nom", source = "nomUtilisateur")
    @Mapping(target = "prenom", source = "prenomUtilisateur")
    @Mapping(target = "adresse", source = "adressePermanent")
    @Mapping(target = "genre", source = "sexe")
    @Mapping(target = "dateNaissance", source = "dateNaissance")
    @Mapping(target = "pays", source = "nationalite")
    @Mapping(target = "email", source = "username")
    @Mapping(target = "codePatient", source = "codePatient")
    @Mapping(target = "telephone", source = "telephone")
    @Mapping(target = "ville", source = "ville")
    @Mapping(target = "statut", source = "statut")
    @Mapping(target = "groupeSanguin", source = "groupeSanguin")
    @Mapping(target = "allergies", source = "allergies")
    @Mapping(target = "antecedents", source = "antecedents")
    @Mapping(target = "doctorCreateCode", source = "doctorCreateCode")
    PatientFeignDto toPatientFeignDto(PatientDto dto);

    /**
     * Calcule l'âge à partir de la date de naissance
     */
    default Long calculateAge(LocalDate dateNaissance) {
        if (dateNaissance == null) {
            return null;
        }
        int years = Period.between(dateNaissance, LocalDate.now()).getYears();
        return Long.valueOf(years);
    }
}